// src/lib/features/admin/adminTypes.ts

import { SystemRole, SanitizedUserDto } from "../auth/authTypes";
import { Event } from "../event/eventTypes";

/**
 * Represents the detailed view of a user as seen in the admin panel.
 * It extends the basic user DTO with moderation-specific fields.
 */
export type AdminUserView = SanitizedUserDto & {
  isVerifiedCreator: boolean;
  isBanned: boolean;
  banReason: string | null;
  bannedUntil: Date | null;
};

/**
 * Represents a pending event as seen in the admin approval list.
 * It includes populated info about the creator and category.
 */
export type PendingEventView = Omit<Event, "creatorId" | "categoryId"> & {
  creatorId: {
    _id: string;
    name: string;
    username: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
};

// --- Data Transfer Objects (DTOs) for Mutations ---

/**
 * The shape of the data sent to the API to update a user's role.
 */
export interface UpdateUserRoleDto {
  systemRole: SystemRole;
}

/**
 * The shape of the data sent to the API to ban a user.
 */
export interface BanUserDto {
  banReason: string;
  bannedUntil?: Date | null;
}

// --- API Response Shapes ---

/**
 * The expected shape of the API response for fetching all users.
 */
export interface GetAllUsersApiResponse {
  status: string;
  data: {
    users: AdminUserView[];
  };
}

/**
 * The expected shape of the API response for fetching pending events.
 */
export interface GetPendingEventsApiResponse {
  status: string;
  data: {
    events: PendingEventView[];
  };
}
