//src/features/map/map.routes.ts
import { Router } from "express";
import { mapController } from "./map.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { geocodeSchema, reverseGeocodeSchema } from "./map.validation.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

router.use(requireAuth);

router.get("/geocode", validate(geocodeSchema), mapController.geocode);

/**
 * ✅ The /places-nearby route has been removed.
 */

router.get(
  "/reverse-geocode",
  validate(reverseGeocodeSchema),
  mapController.reverseGeocode
);

export default router;
