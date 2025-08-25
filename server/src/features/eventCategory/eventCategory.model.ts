// src/features/eventCategory/eventCategory.model.ts

import { Schema, model } from "mongoose";

const eventCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const EventCategory = model("EventCategory", eventCategorySchema);
export default EventCategory;
