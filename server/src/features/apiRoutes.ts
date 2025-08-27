// FILE: src/routes/apiRoutes.ts (Corrected)

import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/user/user.routes.js";
import eventRoutes from "../features/event/event.routes.js";
import eventCategoryRoutes from "../features/eventCategory/eventCategory.routes.js";
import adminRoutes from "../features/admin/admin.routes.js";
import verificationRequestRoutes from "../features/verificationRequest/verificationRequest.routes.js";
import { savedEventRoutes } from "../features/savedEvent/savedEvent.routes.js";
import { commentRoutes } from "../features/comment/comment.routes.js";
import mapRoutes from "../features/map/map.routes.js";
import checkInRoutes from "../features/checkIn/checkIn.routes.js"; // ✅ 1. Import check-in routes

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
router.use("/saved-events", savedEventRoutes);
router.use("/comments", commentRoutes);
router.use("/maps", mapRoutes);
router.use("/check-in", checkInRoutes); // ✅ 2. Use the new check-in routes

export default router;
