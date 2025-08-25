// src/db/models/refreshToken.model.ts

import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    jti: { type: String, required: true, unique: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ✅ ADDED: Speeds up finding tokens by user ID.
    },
    revoked: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { timestamps: true }
);

const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
