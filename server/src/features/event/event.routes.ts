import { Router } from "express";
import { eventController } from "./event.controller.js";
import { validate } from "../../middleware/validate.js";
import { createEventSchema, updateEventSchema } from "./event.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { checkVerification } from "../../middleware/checkVerification.js";
import { uploadImage } from "../../middleware/multer.config.js";
import { saveEventSubRouter } from "../savedEvent/savedEvent.routes.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// --- Public Routes ---
router.get("/", eventController.getAll);

// --- Protected Routes ---

router.get("/me", requireAuth, eventController.getMyEvents);
// GET /api/v1/events/my/:eventId - Get a single event created by the current user
router.get("/my/:eventId", requireAuth, eventController.getMyEventById);
router.patch(
  "/my/:eventId/resubmit",
  requireAuth,
  eventController.resubmitEvent
);

// This public route is now correctly placed after the more specific '/me' route.
router.get("/:eventId", eventController.getOne);

// POST /api/v1/events - Create a new event
router.post(
  "/",
  requireAuth,
  checkVerification,
  uploadImage.array("eventImages", 5),
  validate(createEventSchema),
  eventController.create
);

// PATCH /api/v1/events/:eventId - Update an event
router.patch(
  "/:eventId",
  requireAuth,
  validate(updateEventSchema),
  eventController.update
);

// DELETE /api/v1/events/:eventId - Delete an event
router.delete("/:eventId", requireAuth, eventController.remove);

router.use("/:eventId/save", saveEventSubRouter);

export default router;
