import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User, RefreshToken } from "../../db/mongo.js";
import { User as UserType } from "../../types/user.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";
import {
  generateAccessToken,
  generateAndStoreRefreshToken,
  verifyAndValidateRefreshToken,
} from "../../utils/jwt.utils.js";
import {
  SignUpInputDto,
  LoginInputDto,
  RefreshTokenInputDto,
  AuthTokens,
  LogoutInputDto,
} from "./auth.types.js";
import axios from "axios";
import { config } from "../../config/index.js";

const sanitizeUser = (user: any): Omit<UserType, "hashedPassword"> => {
  const userObject = user._doc || user;
  const { hashedPassword, ...sanitized } = userObject;
  if (userObject._id) {
    sanitized._id = userObject._id.toString();
  }
  return sanitized;
};

export class AuthService {
  /**
   * ✅ UPDATED: Handles user registration with only email and password.
   * A unique username and a matching default name are generated automatically.
   */
  public async registerUser(input: SignUpInputDto): Promise<{
    user: Omit<UserType, "hashedPassword">;
    tokens: AuthTokens;
  }> {
    const { email, password } = input;

    // 1. Check if a user with the given email already exists.
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    }).lean();

    if (existingUser) {
      throw createHttpError(409, "An account with this email already exists.");
    }

    // 2. Generate a unique default username from the email prefix.
    const baseUsername = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 15); // Ensure it's not too long

    let finalUsername = baseUsername;
    const userWithSameUsername = await User.findOne({
      username: baseUsername,
    }).lean();

    // If the base username is taken, append a short random suffix.
    if (userWithSameUsername) {
      const uniqueSuffix = crypto.randomBytes(3).toString("hex"); // 6 random characters
      finalUsername = `${baseUsername}${uniqueSuffix}`;
    }

    // Use the generated username as the default display name.
    const defaultName = finalUsername;

    // 3. Hash the password and create the new user.
    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = await User.create({
      email: email.toLowerCase(),
      hashedPassword,
      username: finalUsername,
      name: defaultName,
    });
    const user = userDoc.toObject();
    logger.info({ userId: user._id }, "New user created successfully.");

    // 4. Generate access and refresh tokens for the new user.
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      systemRole: user.systemRole,
    });
    const { token: refreshToken, expiresAt } =
      await generateAndStoreRefreshToken(user._id.toString());

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt },
    };
  }

  public async loginUser(input: LoginInputDto): Promise<{
    user: Omit<UserType, "hashedPassword">;
    tokens: AuthTokens;
  }> {
    const { email, password } = input;
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+hashedPassword")
      .lean();

    if (!user) {
      throw createHttpError(404, "Invalid email or password.");
    }

    if (user.isBanned) {
      if (user.bannedUntil && user.bannedUntil < new Date()) {
        await User.findByIdAndUpdate(user._id, {
          isBanned: false,
          banReason: null,
          bannedUntil: null,
        });
        logger.info({ userId: user._id }, "User's temporary ban has expired.");
      } else {
        const reason = user.banReason || "No reason provided.";
        const message = `This account has been banned. Reason: ${reason}`;
        throw createHttpError(403, message);
      }
    }

    if (!user.hashedPassword) {
      throw createHttpError(
        400,
        "This account may use a social provider to log in."
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword
    );
    if (!isPasswordCorrect) {
      throw createHttpError(401, "Invalid email or password.");
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      systemRole: user.systemRole,
    });
    const { token: refreshToken, expiresAt } =
      await generateAndStoreRefreshToken(user._id.toString());

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt },
    };
  }

  public async handleRefreshTokenRotation(
    input: RefreshTokenInputDto
  ): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
    newRefreshTokenExpiresAt: Date;
  }> {
    if (!input.incomingRefreshToken) {
      throw createHttpError(401, "Refresh token is required.");
    }
    const decodedOldToken = await verifyAndValidateRefreshToken(
      input.incomingRefreshToken
    );

    const newAccessToken = generateAccessToken({
      id: decodedOldToken.id,
      systemRole: decodedOldToken.systemRole,
    });

    const { token: newRefreshToken, expiresAt: newRefreshTokenExpiresAt } =
      await generateAndStoreRefreshToken(decodedOldToken.id);

    await this.revokeTokenByJti(decodedOldToken.jti);

    return { newAccessToken, newRefreshToken, newRefreshTokenExpiresAt };
  }

  public async handleUserLogout(input: LogoutInputDto): Promise<void> {
    if (!input.incomingRefreshToken) {
      return;
    }
    try {
      const decoded = await verifyAndValidateRefreshToken(
        input.incomingRefreshToken
      );
      await this.revokeTokenByJti(decoded.jti);
    } catch (error) {
      logger.warn(
        { err: error },
        "Logout failed: could not verify or revoke token."
      );
    }
  }

  public async findOrCreateOAuthUser(profile: {
    email: string;
    name?: string | null;
    image?: string | null;
  }): Promise<{ user: Omit<UserType, "hashedPassword">; tokens: AuthTokens }> {
    let user;
    const existingUser = await User.findOne({
      email: profile.email.toLowerCase(),
    }).lean();

    if (existingUser) {
      user = await User.findOneAndUpdate(
        { email: profile.email.toLowerCase() },
        {
          name: existingUser.name ?? profile.name ?? "New User",
          profileImage: existingUser.profileImage ?? profile.image ?? null,
        },
        { new: true }
      ).lean();
    } else {
      const baseUsername = profile.email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, "");
      const uniqueSuffix = crypto.randomBytes(4).toString("hex");
      const username = `${baseUsername}_${uniqueSuffix}`;

      const newUserDoc = await User.create({
        email: profile.email.toLowerCase(),
        name: profile.name ?? "New User",
        username: username,
        ...(profile.image && { profileImage: profile.image }),
      });
      user = newUserDoc.toObject();
    }

    if (!user) {
      throw createHttpError(500, "Could not create or find user account.");
    }

    const userIdStr = user._id.toString();
    await this.revokeAllRefreshTokensForUser(userIdStr);

    const accessToken = generateAccessToken({
      id: userIdStr,
      systemRole: user.systemRole,
    });
    const { token: refreshToken, expiresAt } =
      await generateAndStoreRefreshToken(userIdStr);

    return {
      user: sanitizeUser(user),
      tokens: { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt },
    };
  }

  public async revokeTokenByJti(jti: string): Promise<void> {
    await RefreshToken.updateOne({ jti }, { revoked: true });
  }

  public async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, revoked: false },
      { revoked: true }
    );
    logger.info({ userId }, `Revoked all active sessions.`);
  }

  // ✅ NEW: Handles the entire Google Sign-In flow
  public async handleGoogleSignIn(code: string) {
    // 1. Exchange the code for an access token
    const { data: tokenData } = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code,
          client_id: config.oauth.google.clientId,
          client_secret: config.oauth.google.clientSecret,
          redirect_uri: config.oauth.redirectUri,
          grant_type: "authorization_code",
        },
      }
    );

    // 2. Use the access token to get the user's profile
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    // 3. Find or create the user and generate our app's tokens
    return this.findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name,
      image: profile.picture,
    });
  }
}

export const authService = new AuthService();
