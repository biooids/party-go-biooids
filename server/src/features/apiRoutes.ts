// FILE: src/routes/apiRoutes.ts (Corrected)

import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/user/user.routes.js";
import eventRoutes from "../features/event/event.routes.js";
import eventCategoryRoutes from "../features/eventCategory/eventCategory.routes.js";
import adminRoutes from "../features/admin/admin.routes.js";
import verificationRequestRoutes from "../features/verificationRequest/verificationRequest.routes.js";

// Main API router that aggregates all feature routes
// This router is used to handle all API requests in the application.

const router: Router = Router();

// This middleware runs on all API routes
router.use(authenticate());

router.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "API router is healthy." });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/event-categories", eventCategoryRoutes);
router.use("/admin", adminRoutes);
router.use("/verification-requests", verificationRequestRoutes);

export default router;
