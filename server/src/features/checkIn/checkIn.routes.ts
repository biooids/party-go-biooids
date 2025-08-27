// src/features/checkIn/checkIn.routes.ts

import { Router } from "express";
import { checkInController } from "./checkIn.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { checkInSchema } from "./checkIn.validation.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// POST /api/v1/check-in - Process a user's QR code check-in
router.post(
  "/",
  requireAuth,
  validate(checkInSchema),
  checkInController.checkIn
);

export default router;
