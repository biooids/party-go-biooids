// src/lib/features/eventCategory/eventCategorySchemas.ts

import { z } from "zod";

/**
 * Zod schema for a "Create Category" form (used in an admin panel).
 */
export const createCategorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
});

/**
 * Zod schema for an "Update Category" form (used in an admin panel).
 */
export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;
