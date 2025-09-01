// src/features/follow/follow.model.ts

import { Schema, model, Types } from "mongoose";

const followSchema = new Schema(
  {
    followerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    followingId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from following the same person more than once
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = model("Follow", followSchema);
export default Follow;
