// src/features/event/event.validation.ts

import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Event name must be at least 3 characters long."),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long."),
    address: z.string().min(5, "Address is required."),
    date: z
      .string()
      .pipe(z.coerce.date())
      .refine((data) => data > new Date(), {
        message: "Event date must be in the future.",
      }),
    price: z.coerce.number().min(0, "Price must be a positive number."),
    categoryId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid Category ID.",
    }),
  }),
});

export const updateEventSchema = z.object({
  body: createEventSchema.shape.body.partial(),
});

/**
 * ✅ ADDED: Schema to validate query parameters for the nearby events endpoint.
 */
export const getEventsNearbySchema = z.object({
  query: z.object({
    lat: z.coerce.number().min(-90).max(90, "Invalid latitude."),
    lng: z.coerce.number().min(-180).max(180, "Invalid longitude."),
    radius: z.coerce.number().int().positive().max(50000).default(10000),
  }),
});
