// src/features/map/map.routes.ts

import { Router } from "express";
import { mapController } from "./map.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { geocodeSchema, placesNearbySchema } from "./map.validation.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// All map routes require a user to be logged in.
router.use(requireAuth);

/**
 * GET /api/v1/maps/geocode
 * Converts an address string into coordinates.
 * Query param: q (string) - The address to search for.
 */
router.get("/geocode", validate(geocodeSchema), mapController.geocode);

/**
 * GET /api/v1/maps/places-nearby
 * Finds points of interest near a specific location.
 * Query params: lng (number), lat (number)
 */
router.get(
  "/places-nearby",
  validate(placesNearbySchema),
  mapController.getPlacesNearby
);

export default router;
