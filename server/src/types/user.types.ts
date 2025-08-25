// src/types/user.types.ts

import { Types } from "mongoose"; // ✅ ADDED: Import Mongoose's type helper.

export enum SystemRole {
  USER = "USER",
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
}

export interface User {
  _id: Types.ObjectId | string; // ✅ CHANGED: Allow both ObjectId and string.
  name: string;
  username: string;
  email: string;
  hashedPassword?: string | null;
  systemRole: SystemRole;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string | null;
  bannerImage?: string | null;
  bio?: string | null;
}

export interface SanitizedUser {
  id: string; // Note: This is 'id', not '_id', which is good practice for API responses.
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
  bannerImage: string | null;
  systemRole: SystemRole;
}
