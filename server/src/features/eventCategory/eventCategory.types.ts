// src/features/eventCategory/eventCategory.types.ts

import { Types } from "mongoose";

// The base interface representing a complete EventCategory document.
export interface EventCategory {
  _id: Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Data Transfer Object for creating a new category.
export type CreateCategoryInputDto = Omit<
  EventCategory,
  "_id" | "createdAt" | "updatedAt"
>;

// Data Transfer Object for updating a category.
export type UpdateCategoryInputDto = Partial<CreateCategoryInputDto>;
