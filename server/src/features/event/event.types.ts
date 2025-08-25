// src/features/event/event.types.ts

import { Types } from "mongoose";
import { EventStatus } from "./event.model.js";

export { EventStatus } from "./event.model.js";

// The base interface representing a complete Event document.
export interface Event {
  _id: Types.ObjectId;
  name: string;
  description: string;
  address: string;
  date: Date;
  price: number;
  imageUrls: string[];
  status: EventStatus;
  creatorId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Data Transfer Object for creating a new event.
export type CreateEventInputDto = Omit<
  Event,
  "_id" | "status" | "creatorId" | "createdAt" | "updatedAt"
>;

// Data Transfer Object for updating an event.
export type UpdateEventInputDto = Partial<CreateEventInputDto>;
