//src/lib/features/event/eventSchemas.ts
import { z } from "zod";

const eventFormSchema = z.object({
  name: z.string().min(3, "Event name is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  address: z.string().min(5, "A valid address is required."),
  date: z.date(),
  time: z
    .string()
    .min(1, "Please select a time for the event.")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format."),
  price: z.number().min(0, "Price must be 0 or more."),
  categoryId: z.string().min(1, "You must select a category."),
});

export const createEventSchema = eventFormSchema;

export type CreateEventFormValues = z.infer<typeof createEventSchema>;

export const updateEventSchema = eventFormSchema.partial();
export type UpdateEventFormValues = z.infer<typeof updateEventSchema>;
