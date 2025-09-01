// src/features/user/user.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createHttpError } from "../../utils/error.factory.js";
import { userService } from "./user.service.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";
import { logger } from "../../config/logger.js";
import { config } from "../../config/index.js";
import { User as UserType } from "../../types/user.types.js";

const sanitizeUserForResponse = (
  user: any
): Omit<UserType, "hashedPassword"> => {
  const userObject = user._doc || user;
  const { hashedPassword, ...sanitizedUser } = userObject;
  return sanitizedUser;
};

class UserController {
  /**
   * ✅ NEW: Handles fetching multiple user profiles in bulk.
   */
  getUsersByUsernames = asyncHandler(async (req: Request, res: Response) => {
    const { usernames } = req.query;
    if (typeof usernames !== "string" || !usernames) {
      throw createHttpError(400, "Usernames query parameter is required.");
    }
    const usernameArray = usernames.split(",").map((u) => u.trim());
    const currentUserId = req.user?.id;

    const users = await userService.findManyUsersByUsernames(
      usernameArray,
      currentUserId
    );

    res.status(200).json({
      status: "success",
      data: { users },
    });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await userService.findUserById(userId);
    if (!user) {
      throw createHttpError(404, "Authenticated user data could not be found.");
    }
    res.status(200).json({
      status: "success",
      data: { user: sanitizeUserForResponse(user) },
    });
  });

  getUserByUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const currentUserId = req.user?.id;
    const userProfile = await userService.findUserByUsername(
      username,
      currentUserId
    );
    if (!userProfile) {
      throw createHttpError(404, `User profile for @${username} not found.`);
    }
    res.status(200).json({
      status: "success",
      data: { user: userProfile },
    });
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updateData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.profileImage?.[0]) {
      logger.info({ userId }, "New profile image received, uploading...");
      const result = await uploadToCloudinary(
        files.profileImage[0].buffer,
        "user_assets",
        `profile_${userId}`
      );
      updateData.profileImage = result.secure_url;
    }

    if (files?.bannerImage?.[0]) {
      logger.info({ userId }, "New banner image received, uploading...");
      const result = await uploadToCloudinary(
        files.bannerImage[0].buffer,
        "user_assets",
        `banner_${userId}`
      );
      updateData.bannerImage = result.secure_url;
    }

    if (Object.keys(updateData).length === 0 && !req.files) {
      throw createHttpError(400, "No update data provided.");
    }

    const updatedUser = await userService.updateUserProfile(userId, updateData);
    res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
      data: { user: sanitizeUserForResponse(updatedUser) },
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await userService.changeUserPassword(userId, req.body);
    res.clearCookie(config.cookies.refreshTokenName);
    res.status(200).json({
      status: "success",
      message: "Password changed successfully. Please log in again.",
    });
  });

  deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await userService.deleteUserAccount(userId);
    res.clearCookie(config.cookies.refreshTokenName);
    res.status(204).send();
  });

  followUser = asyncHandler(async (req: Request, res: Response) => {
    const followerId = req.user!.id;
    const { username } = req.params;
    await userService.followUser(followerId, username);
    res.status(200).json({ status: "success", message: "User followed." });
  });

  unfollowUser = asyncHandler(async (req: Request, res: Response) => {
    const followerId = req.user!.id;
    const { username } = req.params;
    await userService.unfollowUser(followerId, username);
    res.status(200).json({ status: "success", message: "User unfollowed." });
  });

  getFollowers = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const users = await userService.getFollowers(username);
    res.status(200).json({
      status: "success",
      data: { users },
    });
  });

  getFollowing = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const users = await userService.getFollowing(username);
    res.status(200).json({
      status: "success",
      data: { users },
    });
  });
}

export const userController = new UserController();
