// src/features/admin/admin.types.ts

import { SystemRole } from "../../types/user.types.js";

/**
 * Data Transfer Object for updating a user's system role.
 * Used by Super Admins.
 */
export interface UpdateUserRoleDto {
  systemRole: SystemRole;
}

/**
 * Data Transfer Object for banning a user.
 * Includes a reason and an optional duration for the ban.
 */
export interface BanUserDto {
  banReason: string;
  bannedUntil?: Date | null;
}
