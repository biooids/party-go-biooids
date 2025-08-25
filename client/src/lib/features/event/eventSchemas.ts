// src/lib/features/event/eventSchemas.ts

import { z } from "zod";

/**
 * Zod schema for the "Create Event" form.
 */
export const createEventSchema = z.object({
  name: z.string().min(3, "Event name is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  address: z.string().min(5, "A valid address is required."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid date is required.",
  }),
  price: z.coerce.number().min(0, "Price must be 0 or more."),
  categoryId: z.string().min(1, "You must select a category."),
});

/**
 * Zod schema for the "Update Event" form. All fields are optional.
 */
export const updateEventSchema = createEventSchema.partial();

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
export type UpdateEventFormValues = z.infer<typeof updateEventSchema>;
