// src/middleware/authorize.ts

import { Request, Response, NextFunction } from "express";
import { SystemRole } from "../types/user.types.js";
import { createHttpError } from "../utils/error.factory.js";
import { asyncHandler } from "./asyncHandler.js";

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * Must be used AFTER the `authenticate` middleware.
 * @param allowedRoles - An array of roles that are allowed to access the route.
 */
export const authorize = (allowedRoles: SystemRole[]) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    // The authenticate middleware should have already attached the user.
    if (!req.user) {
      throw createHttpError(401, "Authentication required.");
    }

    const userRole = req.user.systemRole;

    // Check if the user's role is in the list of allowed roles.
    if (allowedRoles.includes(userRole)) {
      return next(); // User has permission, proceed to the next handler.
    }

    // If the role is not allowed, send a 403 Forbidden error.
    throw createHttpError(
      403,
      "You do not have permission to perform this action."
    );
  });
