// src/features/user/user.routes.ts

import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { uploadImage } from "../../middleware/multer.config.js";
import { validate } from "../../middleware/validate.js";
import {
  updateUserProfileSchema,
  changePasswordSchema,
} from "./user.validation.js";

const router: Router = Router();

// --- PUBLIC ROUTES ---

router.get("/profiles", userController.getUsersByUsernames);

// Fetch a single public profile by username
router.get("/profile/:username", userController.getUserByUsername);

// Fetch followers and following lists for a user
router.get("/:username/followers", userController.getFollowers);
router.get("/:username/following", userController.getFollowing);

// --- PROTECTED ROUTES ---
const requireAuth = authenticate({ required: true });

router.get("/me", requireAuth, userController.getMe);
router.patch(
  "/me",
  requireAuth,
  uploadImage.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  validate(updateUserProfileSchema),
  userController.updateMyProfile
);
router.delete("/me", requireAuth, userController.deleteMyAccount);

router.patch(
  "/me/password",
  requireAuth,
  validate(changePasswordSchema),
  userController.changePassword
);
router.post("/:username/follow", requireAuth, userController.followUser);
router.delete("/:username/follow", requireAuth, userController.unfollowUser);
export default router;
