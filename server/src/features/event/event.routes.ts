// src/features/event/event.routes.ts

import { Router } from "express";
import { eventController } from "./event.controller.js";
import { validate } from "../../middleware/validate.js";
import { createEventSchema, updateEventSchema } from "./event.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { checkVerification } from "../../middleware/checkVerification.js";
import { uploadImage } from "../../middleware/multer.config.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// --- Public Routes ---
router.get("/", eventController.getAll);
router.get("/:eventId", eventController.getOne);

// --- Protected Routes ---

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

export default router;
