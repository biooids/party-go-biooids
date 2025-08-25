// src/lib/features/verificationRequest/verificationRequestTypes.ts

import { EventCategory } from "../eventCategory/eventCategoryTypes";

/**
 * Enum for verification statuses, mirroring the backend.
 */
export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * The shape of a complete verification request object from the API.
 */
export interface VerificationRequest {
  _id: string;
  // ✅ FIXED: The userId is now an object because the backend populates it.
  userId: {
    _id: string;
    name: string;
    username: string;
    email: string;
  };
  status: VerificationStatus;
  reason: string;
  location: string;
  preferredCategories: EventCategory[]; // Populated on the admin side
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The shape of the data the user submits to create a new request.
 */
export interface CreateVerificationRequestDto {
  reason: string;
  location: string;
  preferredCategories: string[]; // Sent as an array of category IDs
}

/**
 * The shape of the API response after submitting a request.
 */
export interface VerificationRequestApiResponse {
  status: string;
  message: string;
  data: {
    request: VerificationRequest;
  };
}
