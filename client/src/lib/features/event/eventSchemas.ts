// src/lib/features/event/eventSchemas.ts

import { z } from "zod";

const eventFormObject = z.object({
  name: z.string().min(3, "Event name is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  address: z.string().min(5, "A valid address is required."),

  date: z.date(),
  // Use chaining for required strings, which is the standard pattern.
  time: z
    .string()
    .min(1, "Please select a time for the event.")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format."),
  price: z.coerce.number().min(0, "Price must be 0 or more."),
  categoryId: z.string().min(1, "You must select a category."),
});

export const createEventSchema = eventFormObject
  .transform((data) => {
    const [hours, minutes] = data.time.split(":").map(Number);
    const combinedDate = new Date(data.date);
    combinedDate.setHours(hours, minutes);

    return {
      ...data,
      date: combinedDate.toISOString(), // The 'date' field is now a string
    };
  })
  .refine((data) => new Date(data.date) > new Date(), {
    message: "Event date must be in the future.",

    path: ["date"],
  });

export const updateEventSchema = eventFormObject.partial();

// This type is correctly inferred from the OUTPUT of the createEventSchema's transform.
export type CreateEventFormValues = z.infer<typeof createEventSchema>;

// This type is correctly inferred from the OUTPUT of the updateEventSchema.
export type UpdateEventFormValues = z.infer<typeof updateEventSchema>;
