// src/features/savedEvent/savedEvent.model.ts

import { Schema, model, Types } from "mongoose";

const savedEventSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only save an event once.
savedEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const SavedEvent = model("SavedEvent", savedEventSchema);
export default SavedEvent;
