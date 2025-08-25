// src/features/admin/admin.validation.ts

import { z } from "zod";
import { SystemRole } from "../../types/user.types.js";

/**
 * Zod schema for validating the request to update a user's role.
 * Ensures the provided role is one of the valid SystemRole enum values.
 */
export const updateUserRoleSchema = z.object({
  body: z.object({
    systemRole: z.enum(
      [SystemRole.USER, SystemRole.ADMIN, SystemRole.SUPER_ADMIN],
      {
        message:
          "Invalid system role provided. Must be USER, ADMIN, or SUPER_ADMIN.",
      }
    ),
  }),
});

/**
 * Zod schema for validating the request to ban a user.
 * Requires a reason and allows for an optional ban duration.
 */
export const banUserSchema = z.object({
  body: z.object({
    banReason: z
      .string()
      .min(10, "A detailed ban reason of at least 10 characters is required."),
    bannedUntil: z.string().pipe(z.coerce.date()).optional().nullable(),
  }),
});
