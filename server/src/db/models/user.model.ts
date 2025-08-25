// src/db/models/user.model.ts

import { Schema, model } from "mongoose";
import { SystemRole } from "../../types/user.types.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    hashedPassword: {
      type: String,
      required: false,
      select: false,
    },
    profileImage: { type: String, default: null },
    bannerImage: { type: String, default: null },
    bio: { type: String, default: null },
    location: { type: String, default: null, trim: true },
    systemRole: {
      type: String,
      enum: Object.values(SystemRole),
      default: SystemRole.USER,
    },
    isVerifiedCreator: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      required: false,
      default: null,
    },
    bannedUntil: {
      type: Date,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
