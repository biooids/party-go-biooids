// src/features/verificationRequest/verificationRequest.schemas.ts

import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createVerificationRequestSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(
        20,
        "Please provide a more detailed reason (at least 20 characters)."
      )
      .max(500, "Your reason cannot exceed 500 characters."),
    location: z.string().min(3, "Please provide a valid location."),
    preferredCategories: z
      .array(z.string().regex(objectIdRegex, "Invalid category ID."))
      .min(1, "You must select at least one preferred category."),
  }),
});
