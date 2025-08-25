// src/middleware/authenticate.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { User } from "../db/mongo.js";
import { config } from "../config/index.js";
import { asyncHandler } from "./asyncHandler.js";
import { createHttpError } from "../utils/error.factory.js";
import { DecodedAccessTokenPayload } from "../features/auth/auth.types.js";
import { SanitizedUser } from "../types/user.types.js";

interface AuthOptions {
  required?: boolean;
}

/**
 * A flexible authentication middleware.
 * - If `required: true`, it will throw a 401 error for invalid/missing tokens.
 * - If `required: false`, it will attach the sanitized user if found, or null, and continue.
 * @param options - Configuration for the middleware.
 */
export const authenticate = (options: AuthOptions = {}) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const { required = false } = options;
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    if (!token) {
      req.user = null;
      return required
        ? next(
            createHttpError(401, "Authentication required. No token provided.")
          )
        : next();
    }

    try {
      const decoded = jwt.verify(
        token,
        config.jwt.accessSecret
      ) as DecodedAccessTokenPayload;

      if (!decoded.id || decoded.type !== "access") {
        throw new JsonWebTokenError("Invalid token payload.");
      }

      // ✅ SECURITY FIX: Fetch user WITHOUT the password hash by default.
      // The `select: false` on the user model handles this automatically.
      const user = await User.findById(decoded.id).lean();

      if (!user) {
        req.user = null;
        return required
          ? next(createHttpError(401, "User not found."))
          : next();
      }

      // ✅ TYPE SAFETY: Create a sanitized user object that matches the type definition.
      const sanitizedUser: SanitizedUser = {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || null,
        bannerImage: user.bannerImage || null,
        systemRole: user.systemRole,
      };

      req.user = sanitizedUser;
      next();
    } catch (error) {
      req.user = null;
      // For any JWT error (expired, invalid signature), treat as unauthorized.
      return required
        ? next(
            createHttpError(
              401,
              "Invalid or expired token. Please log in again."
            )
          )
        : next();
    }
  });
