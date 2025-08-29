import { z } from "zod";

// A base schema for common event fields to avoid repetition.
const baseEventBodySchema = z.object({
  name: z.string().min(3, "Event name is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  address: z.string().min(5, "A valid address is required."),
  date: z.coerce.date().refine((data) => data > new Date(), {
    message: "Event date must be in the future.",
  }),
  price: z.coerce.number().min(0, "Price must be 0 or more."),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID."),

  // ✅ FIX: Add optional, coerced coordinate fields to accept data from the frontend.
  longitude: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
});

// --- Schema for CREATING an event ---
export const createEventSchema = z.object({
  body: baseEventBodySchema,
  // Validate the files object directly.
  files: z
    .array(z.any())
    .min(1, { message: "At least one event image is required." })
    .max(5, { message: "You can upload a maximum of 5 images." }),
});

// --- Schema for UPDATING an event ---
export const updateEventSchema = z
  .object({
    // For updates, all body fields are optional.
    body: baseEventBodySchema.partial().extend({
      // Explicitly define the field sent from the frontend.
      // Use a transform to parse the JSON string from FormData.
      existingImageUrls: z
        .string()
        .transform((val, ctx) => {
          try {
            const parsed = JSON.parse(val);
            if (
              Array.isArray(parsed) &&
              parsed.every((item) => typeof item === "string")
            ) {
              return parsed as string[];
            }
            throw new Error();
          } catch {
            ctx.addIssue({
              code: "custom",
              message: "Invalid format for existing images.",
            });
            return z.NEVER;
          }
        })
        .optional(),
    }),
    // For updates, the `files` array is optional.
    files: z.array(z.any()).optional(),
  })
  // Add a refinement to ensure at least one image (new or existing) remains.
  .superRefine((data, ctx) => {
    const existingCount = data.body.existingImageUrls?.length || 0;
    const newCount = Array.isArray(data.files) ? data.files.length : 0;

    if (existingCount + newCount === 0) {
      ctx.addIssue({
        code: "custom",
        message: "An event must have at least one image.",
        path: ["body.existingImageUrls"], // Attach error to a relevant field
      });
    }
  });

// --- Schema for GETTING nearby events ---
export const getEventsNearbySchema = z.object({
  query: z.object({
    lat: z.coerce.number().min(-90).max(90, "Invalid latitude."),
    lng: z.coerce.number().min(-180).max(180, "Invalid longitude."),
    radius: z.coerce.number().int().positive().max(50000).default(10000),
  }),
});
