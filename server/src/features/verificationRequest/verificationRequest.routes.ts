// src/features/verificationRequest/verificationRequest.routes.ts

import { Router } from "express";
import { verificationRequestController } from "./verificationRequest.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { createVerificationRequestSchema } from "./verificationRequest.schemas.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// POST /api/v1/verification-requests - Submit a new request to become a creator
router.post(
  "/",
  requireAuth,
  validate(createVerificationRequestSchema),
  verificationRequestController.create
);

router.get("/me", requireAuth, verificationRequestController.getMyRequest);

export default router;
