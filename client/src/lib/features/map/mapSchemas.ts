// src/lib/features/map/mapSchemas.ts

import { z } from "zod";

/**
 * Zod schema for validating the map's geocoding search input on the frontend.
 */
export const geocodeSearchSchema = z.object({
  searchQuery: z.string().min(2, "Search query must be at least 2 characters."),
});

export type GeocodeSearchFormValues = z.infer<typeof geocodeSearchSchema>;
