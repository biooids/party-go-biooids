//src/features/directions/directions.validation.ts
import { z } from "zod";

const coordinatePair = z.string().refine(
  (val) => {
    const parts = val.split(",");
    if (parts.length !== 2) return false;
    const [lng, lat] = parts.map(Number);
    return (
      !isNaN(lng) &&
      !isNaN(lat) &&
      lng >= -180 &&
      lng <= 180 &&
      lat >= -90 &&
      lat <= 90
    );
  },
  { message: "Coordinates must be in 'longitude,latitude' format." }
);

export const getDirectionsSchema = z.object({
  query: z.object({
    start: coordinatePair,
    end: coordinatePair,
    profile: z.enum(["driving", "walking", "cycling"]).default("driving"),
  }),
});
