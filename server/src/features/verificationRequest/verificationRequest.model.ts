// src/features/verificationRequest/verificationRequest.model.ts

import { Schema, model, Types } from "mongoose";

export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

const verificationRequestSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    // ✅ ADDED: Location field to help route request to the correct admin.
    location: {
      type: String,
      required: true,
      trim: true,
    },
    // ✅ ADDED: Preferred categories to give admin more context.
    preferredCategories: [
      {
        type: Types.ObjectId,
        ref: "EventCategory",
        required: true,
      },
    ],
    adminNotes: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

const VerificationRequest = model(
  "VerificationRequest",
  verificationRequestSchema
);
export default VerificationRequest;
