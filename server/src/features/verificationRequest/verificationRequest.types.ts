// server/src/features/verificationRequest/verificationRequest.types.ts

import { Types } from "mongoose";
import { VerificationStatus } from "./verificationRequest.model.js";
export { VerificationStatus } from "./verificationRequest.model.js";

export interface VerificationRequest {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: VerificationStatus;
  reason: string;
  location: string;
  preferredCategories: Types.ObjectId[];
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVerificationRequestDto {
  reason: string;
  location: string;
  preferredCategories: string[];
}
