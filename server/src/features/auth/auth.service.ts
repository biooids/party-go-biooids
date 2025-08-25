// src/features/auth/auth.service.ts

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

const sanitizeUser = (user: any): Omit<UserType, "hashedPassword"> => {
  const userObject = user._doc || user;
  const { hashedPassword, ...sanitized } = userObject;
  if (userObject._id) {
    sanitized._id = userObject._id.toString();
  }
  return sanitized;
};

export class AuthService {
  public async registerUser(input: SignUpInputDto): Promise<{
    user: Omit<UserType, "hashedPassword">;
    tokens: AuthTokens;
  }> {
    const { email, username, password, name } = input;

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    }).lean();

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw createHttpError(
          409,
          "An account with this email already exists."
        );
      }
      if (existingUser.username === username.toLowerCase()) {
        throw createHttpError(409, "This username is already taken.");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = await User.create({
      email,
      username,
      hashedPassword,
      name,
    });
    const user = userDoc.toObject();
    logger.info({ userId: user._id }, "New user created successfully.");

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

    //Ban check at the start of the login process.
    if (user.isBanned) {
      // Check if the ban is temporary and has expired.
      if (user.bannedUntil && user.bannedUntil < new Date()) {
        // If the ban has expired, un-ban the user and allow login to proceed.
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
      throw createHttpError(400, "This account uses a social provider.");
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

    // We can directly use the ID from the validated token.
    const newAccessToken = generateAccessToken({
      id: decodedOldToken.id,
      systemRole: decodedOldToken.systemRole,
    });

    const { token: newRefreshToken, expiresAt: newRefreshTokenExpiresAt } =
      await generateAndStoreRefreshToken(decodedOldToken.id);

    // Revoke the old token *after* generating the new one.
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
        email: profile.email,
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
}

export const authService = new AuthService();
