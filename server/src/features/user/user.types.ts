// src/features/user/user.types.ts

import { User as UserType } from "../../types/user.types.js";

// Represents a user object with sensitive data removed for API responses.
export type SanitizedUserDto = Omit<UserType, "hashedPassword">;

// Represents the data needed for a public user profile page.
export type UserProfile = SanitizedUserDto & {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
};

// Represents the data needed for updating a user's profile.
export interface UserProfileUpdateData {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  bannerImage?: string;
}

// ✅ ADDED: Defines the shape for the change password request body.
export interface ChangePasswordInputDto {
  currentPassword: string;
  newPassword: string;
}
