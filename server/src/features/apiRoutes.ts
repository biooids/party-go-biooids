//src/features/apiRoutes.ts
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";

import {
  apiLimiter,
  authLimiter,
  mapApiLimiter,
} from "../middleware/rateLimiter.js";

import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/user/user.routes.js";
import eventRoutes from "../features/event/event.routes.js";
import eventCategoryRoutes from "../features/eventCategory/eventCategory.routes.js";
import adminRoutes from "../features/admin/admin.routes.js";
import verificationRequestRoutes from "../features/verificationRequest/verificationRequest.routes.js";
import { savedEventRoutes } from "../features/savedEvent/savedEvent.routes.js";
import { commentRoutes } from "../features/comment/comment.routes.js";
import mapRoutes from "../features/map/map.routes.js";
import checkInRoutes from "../features/checkIn/checkIn.routes.js";
import directionsRoutes from "../features/directions/directions.routes.js";

const router: Router = Router();

router.use(authenticate());

router.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "API router is healthy." });
});

router.use("/auth", authLimiter, authRoutes);
router.use("/maps", mapApiLimiter, mapRoutes);
router.use("/directions", mapApiLimiter, directionsRoutes);
router.use("/users", apiLimiter, userRoutes);
router.use("/events", apiLimiter, eventRoutes);
router.use("/event-categories", apiLimiter, eventCategoryRoutes);
router.use("/admin", apiLimiter, adminRoutes);
router.use("/verification-requests", apiLimiter, verificationRequestRoutes);
router.use("/saved-events", apiLimiter, savedEventRoutes);
router.use("/comments", apiLimiter, commentRoutes);
router.use("/check-in", apiLimiter, checkInRoutes);

export default router;
