// src/features/comment/comment.routes.ts

import { Router } from "express";
import { commentController } from "./comment.controller.js";
import { validate } from "../../middleware/validate.js";
import { createCommentSchema } from "./comment.validation.js";
import { authenticate } from "../../middleware/authenticate.js";

const router: Router = Router();
const requireAuth = authenticate({ required: true });

// --- Standalone Comment Routes ---
router.patch(
  "/:commentId",
  requireAuth,
  validate(createCommentSchema),
  commentController.update
);

router.delete("/:commentId", requireAuth, commentController.remove);

const commentSubRouter: Router = Router({ mergeParams: true });

commentSubRouter.get("/", commentController.getByEventId);

commentSubRouter.post(
  "/",
  requireAuth,
  validate(createCommentSchema),
  commentController.create
);

export { router as commentRoutes, commentSubRouter };
