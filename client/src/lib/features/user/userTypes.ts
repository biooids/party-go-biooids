// src/lib/features/user/userTypes.ts

import { SanitizedUserDto } from "../auth/authTypes";

// --- DTOs for API requests ---

// This is the data we SEND TO the server when updating a profile.
export interface UserUpdateInputDto {
  name?: string;
  username?: string;
  bio?: string;
  location?: string | null;
}

export interface ChangePasswordInputDto {
  currentPassword: string;
  newPassword: string;
}

// --- Types for data we RECEIVE FROM the server ---

export type UserProfile = SanitizedUserDto & {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  location?: string | null;
  bio?: string | null;
};

// This represents the data for the currently logged-in user.
export type CurrentUser = SanitizedUserDto & {
  location?: string | null;
  bio?: string | null;
};

// --- API Response Shapes ---

// The shape for the /me endpoint
export interface UserProfileApiResponse {
  status: string;
  message?: string;
  data: {
    user: UserProfile;
  };
}

// The shape for the public /profile/:username endpoint
export interface PublicProfileApiResponse {
  status: string;
  message?: string;
  data: {
    user: UserProfile;
  };
}

export type FollowUser = Pick<
  SanitizedUserDto,
  "_id" | "name" | "username" | "profileImage"
>;
