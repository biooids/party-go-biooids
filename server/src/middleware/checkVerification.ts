// src/middleware/checkVerification.ts

import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./asyncHandler.js";
import { User } from "../db/mongo.js";
import { createHttpError } from "../utils/error.factory.js";
import { SystemRole } from "../types/user.types.js"; // ✅ 1. Import SystemRole

/**
 * Middleware to check if the authenticated user has permission to create an event.
 * Allows access if the user is a verified creator OR an admin/super admin.
 * Must be used AFTER the `authenticate` middleware.
 */
export const checkVerification = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createHttpError(401, "Authentication required.");
    }

    // This still requires a database query to get the full user object.
    const fullUser = await User.findById(req.user.id).lean();

    if (!fullUser) {
      throw createHttpError(404, "User not found.");
    }

    // ✅ 2. Update the permission logic.
    // Check if the user is verified OR if their role is Admin or Super Admin.
    const canCreateEvents =
      fullUser.isVerifiedCreator ||
      fullUser.systemRole === SystemRole.ADMIN ||
      fullUser.systemRole === SystemRole.SUPER_ADMIN;

    if (canCreateEvents) {
      return next(); // User has permission, proceed.
    }

    // If none of the conditions are met, send a 403 Forbidden error.
    throw createHttpError(
      403,
      "You do not have permission to create new events."
    );
  }
);
