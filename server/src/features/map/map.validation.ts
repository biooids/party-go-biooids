// src/features/map/map.validation.ts

import { z } from "zod";

/**
 * Validates the query for geocoding an address.
 * Expects a 'q' parameter and optional 'lng' and 'lat' for proximity.
 */
export const geocodeSchema = z.object({
  query: z.object({
    q: z.string().min(2, "Search query must be at least 2 characters."),
    // ✅ ADDED: Optional coordinates for proximity biasing.
    lng: z.coerce.number().min(-180).max(180).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
  }),
});

/**
 * Validates the query for finding nearby places.
 */
export const placesNearbySchema = z.object({
  query: z.object({
    lng: z.coerce.number().min(-180).max(180),
    lat: z.coerce.number().min(-90).max(90),
    radius: z.coerce.number().int().positive().default(5000),
    categories: z.string().optional(),
  }),
});

/**
 * ✅ ADDED: Schema to validate coordinates for reverse geocoding.
 */
export const reverseGeocodeSchema = z.object({
  query: z.object({
    lng: z.coerce.number().min(-180).max(180, "Invalid longitude."),
    lat: z.coerce.number().min(-90).max(90, "Invalid latitude."),
  }),
});
