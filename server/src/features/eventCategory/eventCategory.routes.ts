// src/features/eventCategory/eventCategory.routes.ts

import { Router } from "express";
import { eventCategoryController } from "./eventCategory.controller.js";
import { validate } from "../../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./eventCategory.validation.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { SystemRole } from "../../types/user.types.js";

const router: Router = Router();

// --- Public Routes ---
// These routes are public so the frontend can fetch category lists for dropdowns.
router.get("/", eventCategoryController.getAll);
router.get("/:categoryId", eventCategoryController.getOne);

// --- Admin-Only Protected Routes ---
const requireAuth = authenticate({ required: true });
const requireAdmin = authorize([SystemRole.ADMIN, SystemRole.SUPER_ADMIN]);

// POST /api/v1/event-categories - Create a new category
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createCategorySchema),
  eventCategoryController.create
);

// PATCH /api/v1/event-categories/:categoryId - Update a category
router.patch(
  "/:categoryId",
  requireAuth,
  requireAdmin,
  validate(updateCategorySchema),
  eventCategoryController.update
);

// DELETE /api/v1/event-categories/:categoryId - Delete a category
router.delete(
  "/:categoryId",
  requireAuth,
  requireAdmin,
  eventCategoryController.remove
);

export default router;
