// src/lib/features/verificationRequest/verificationRequestSchemas.ts

import { z } from "zod";

/**
 * Zod schema for the "Apply to be a Creator" form.
 */
export const createVerificationRequestSchema = z.object({
  reason: z
    .string()
    .min(20, "Please provide a more detailed reason (at least 20 characters).")
    .max(500, "Your reason cannot exceed 500 characters."),
  location: z.string().min(3, "Please provide a valid location or city."),
  preferredCategories: z
    .array(z.string())
    .min(1, "You must select at least one preferred category."),
});

export type CreateVerificationRequestFormValues = z.infer<
  typeof createVerificationRequestSchema
>;
