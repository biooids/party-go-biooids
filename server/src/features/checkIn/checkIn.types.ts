// src/features/checkIn/checkIn.types.ts

import { Types } from "mongoose";

export interface CheckIn {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for a check-in attempt.
 * This is the data the user's device will send after scanning a QR code.
 */
export interface CheckInDto {
  eventId: string;
  qrCodeSecret: string;
}
