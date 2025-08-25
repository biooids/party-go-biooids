// src/middleware/checkVerification.ts

import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./asyncHandler.js";
import { User } from "../db/mongo.js";
import { createHttpError } from "../utils/error.factory.js";

/**
 * Middleware to check if the authenticated user is a verified event creator.
 * Must be used AFTER the `authenticate` middleware.
 */
export const checkVerification = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createHttpError(401, "Authentication required.");
    }

    // Note: This requires a database query. For higher performance, you could
    // modify the `authenticate` middleware to include the `isVerifiedCreator`
    // status in the `req.user` object to avoid this extra database call.
    const fullUser = await User.findById(req.user.id).lean();

    if (!fullUser) {
      throw createHttpError(404, "User not found.");
    }

    if (fullUser.isVerifiedCreator) {
      return next(); // User is verified, proceed.
    }

    // If not verified, send a 403 Forbidden error.
    throw createHttpError(403, "Only verified creators can post new events.");
  }
);
