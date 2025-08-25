// src/features/eventCategory/eventCategory.validation.ts

import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Category name must be at least 3 characters long."),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long."),
  }),
});

export const updateCategorySchema = z.object({
  body: createCategorySchema.shape.body.partial(), // All fields are optional for updates
});
