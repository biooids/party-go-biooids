import { Router } from "express";
import { directionsController } from "./directions.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { getDirectionsSchema } from "./directions.validation.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// All directions routes require a user to be logged in.
router.use(requireAuth);

/**
 * GET /api/v1/directions
 * Provides a route between a start and end point.
 * Query params:
 * - start (string): "longitude,latitude"
 * - end (string): "longitude,latitude"
 * - profile (string): "driving" (default), "walking", or "cycling"
 */
router.get("/", validate(getDirectionsSchema), directionsController.get);

export default router;
