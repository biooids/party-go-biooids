// src/features/map/map.routes.ts

import { Router } from "express";
import { mapController } from "./map.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { geocodeSchema, reverseGeocodeSchema } from "./map.validation.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// All map routes require an authenticated user.
router.use(requireAuth);

// Route for searching Points of Interest (clubs, hotels, etc.)
router.get("/search", validate(geocodeSchema), mapController.search);
router.get("/retrieve/:mapboxId", mapController.retrieve);

// Route for converting an address to coordinates
router.get("/geocode", validate(geocodeSchema), mapController.geocode);

// Route for converting coordinates to an address
router.get(
  "/reverse-geocode",
  validate(reverseGeocodeSchema),
  mapController.reverseGeocode
);

export default router;
