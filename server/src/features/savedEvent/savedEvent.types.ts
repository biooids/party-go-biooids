// src/features/savedEvent/savedEvent.types.ts

import { Types } from "mongoose";
import { Event } from "../event/event.types";

export interface SavedEvent {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  eventId: Types.ObjectId | Event; // Can be populated
  createdAt: Date;
  updatedAt: Date;
}
