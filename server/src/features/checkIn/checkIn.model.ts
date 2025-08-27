// src/features/checkIn/checkIn.model.ts

import { Schema, model, Types } from "mongoose";

const checkInSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true }
);

// This compound index ensures a user can only check in to an event once.
checkInSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const CheckIn = model("CheckIn", checkInSchema);
export default CheckIn;
