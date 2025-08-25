// src/features/admin/admin.routes.ts

import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { validate } from "../../middleware/validate.js";
import { updateUserRoleSchema, banUserSchema } from "./admin.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { SystemRole } from "../../types/user.types.js";

const router: Router = Router();

// Middleware stack for protected routes
const requireAuth = authenticate({ required: true });
const requireAdmin = authorize([SystemRole.ADMIN, SystemRole.SUPER_ADMIN]);
const requireSuperAdmin = authorize([SystemRole.SUPER_ADMIN]);

// --- Event Management Routes (Admin & Super Admin) ---
router.get(
  "/events/pending",
  requireAuth,
  requireAdmin,
  adminController.listPendingEvents
);
router.patch(
  "/events/:eventId/approve",
  requireAuth,
  requireAdmin,
  adminController.approveEvent
);
router.patch(
  "/events/:eventId/reject",
  requireAuth,
  requireAdmin,
  adminController.rejectEvent
);

// --- User Moderation Routes (Admin & Super Admin) ---
router.patch(
  "/users/:userId/ban",
  requireAuth,
  requireAdmin,
  validate(banUserSchema),
  adminController.banUser
);
router.patch(
  "/users/:userId/unban",
  requireAuth,
  requireAdmin,
  adminController.unbanUser
);

// --- User Management Routes (Super Admin Only) ---
router.get(
  "/users",
  requireAuth,
  requireSuperAdmin,
  adminController.listAllUsers
);
router.patch(
  "/users/:userId/role",
  requireAuth,
  requireSuperAdmin,
  validate(updateUserRoleSchema),
  adminController.changeUserRole
);
router.delete(
  "/users/:userId",
  requireAuth,
  requireSuperAdmin,
  adminController.deleteUser
);

export default router;
