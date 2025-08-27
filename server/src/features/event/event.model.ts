// src/features/event/event.model.ts

import { Schema, model, Types } from "mongoose";

export enum EventStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

const eventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    date: { type: Date, required: true },
    price: { type: Number, required: true, default: 0 },
    imageUrls: { type: [String], required: true },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.PENDING,
      index: true,
    },
    creatorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "EventCategory",
      required: true,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
eventSchema.index({ location: "2dsphere" });

const Event = model("Event", eventSchema);
export default Event;
