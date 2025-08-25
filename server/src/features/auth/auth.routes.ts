// src/features/auth/auth.routes.ts

import { Router } from "express";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authLimiter } from "../../middleware/rateLimiter.js";

const router: Router = Router();

// --- Public Routes ---
router.post(
  "/register",
  authLimiter,
  validate(signupSchema),
  authController.signup
);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, authController.refreshAccessToken);
router.post("/oauth", authLimiter, authController.handleOAuth);

// --- Protected Routes ---
const requireAuth = authenticate({ required: true });
router.post("/logout", requireAuth, authController.logout);
router.post("/logout-all", requireAuth, authController.logoutAll);

export default router;
