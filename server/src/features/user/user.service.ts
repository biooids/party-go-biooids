// src/features/user/user.service.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../../db/mongo.js";
import { User as UserType } from "../../types/user.types.js";
import { ChangePasswordInputDto } from "./user.types.js";
import { authService } from "../auth/auth.service.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";
import { deleteFromCloudinary } from "../../config/cloudinary.js";
import Follow from "../follow/follow.model.js";

interface UserProfileUpdateData {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  bannerImage?: string;
}

export class UserService {
  public async findUserByEmail(email: string): Promise<UserType | null> {
    return User.findOne({ email: email.toLowerCase() }).lean();
  }

  // ✅ FIXED: This function is now updated to return the full profile data.
  public async findUserById(id: string) {
    const pipeline: any[] = [
      // Match by the user's ID instead of username
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followingId",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followerId",
          as: "following",
        },
      },
      {
        $addFields: {
          followersCount: { $size: "$followers" },
          followingCount: { $size: "$following" },
          // A user is never following themselves, so this is always false.
          isFollowing: false,
        },
      },
      {
        $project: {
          hashedPassword: 0,
          followers: 0,
          following: 0,
        },
      },
    ];
    const result = await User.aggregate(pipeline);
    // The aggregation returns an array, so we return the first element
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ✅ NEW EFFICIENT METHOD: Finds multiple user profiles by their usernames
   * in a single database query.
   * @param usernames - An array of usernames to fetch.
   * @param currentUserId - (Optional) The ID of the user making the request.
   */
  public async findManyUsersByUsernames(
    usernames: string[],
    currentUserId?: string
  ) {
    const lowercasedUsernames = usernames.map((u) => u.toLowerCase());
    const pipeline: any[] = [
      // 1. Find all users whose username is in the provided array.
      { $match: { username: { $in: lowercasedUsernames } } },
      // The rest of the pipeline is the same as before.
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followingId",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followerId",
          as: "following",
        },
      },
      {
        $addFields: {
          followersCount: { $size: "$followers" },
          followingCount: { $size: "$following" },
          isFollowing: currentUserId
            ? {
                $in: [
                  new mongoose.Types.ObjectId(currentUserId),
                  "$followers.followerId",
                ],
              }
            : false,
        },
      },
      {
        $project: {
          hashedPassword: 0,
          followers: 0,
          following: 0,
        },
      },
    ];
    // This will return an array of user profiles.
    return User.aggregate(pipeline);
  }

  public async findUserByUsername(username: string, currentUserId?: string) {
    const pipeline: any[] = [
      { $match: { username: username.toLowerCase() } },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followingId",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followerId",
          as: "following",
        },
      },
      {
        $addFields: {
          followersCount: { $size: "$followers" },
          followingCount: { $size: "$following" },
          isFollowing: currentUserId
            ? {
                $in: [
                  new mongoose.Types.ObjectId(currentUserId),
                  "$followers.followerId",
                ],
              }
            : false,
        },
      },
      {
        $project: {
          hashedPassword: 0,
          followers: 0,
          following: 0,
        },
      },
    ];
    const result = await User.aggregate(pipeline);
    return result.length > 0 ? result[0] : null;
  }

  public async changeUserPassword(
    userId: string,
    input: ChangePasswordInputDto
  ): Promise<void> {
    const { currentPassword, newPassword } = input;
    const user = await User.findById(userId).select("+hashedPassword").lean();
    if (!user || !user.hashedPassword) {
      throw createHttpError(401, "User not found or has no password set.");
    }
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );
    if (!isPasswordCorrect) {
      throw createHttpError(
        401,
        "The current password you entered is incorrect."
      );
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: userId },
      { hashedPassword: newHashedPassword }
    );
    logger.info({ userId }, "User password changed, revoking all sessions.");
    await authService.revokeAllRefreshTokensForUser(userId);
  }

  public async updateUserProfile(
    userId: string,
    data: UserProfileUpdateData
  ): Promise<UserType> {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, data, {
        new: true,
      }).lean();
      if (!updatedUser) {
        throw createHttpError(404, "User not found for update.");
      }
      logger.info({ userId }, "User profile updated successfully.");
      return updatedUser as UserType;
    } catch (error: any) {
      if (error.code === 11000) {
        throw createHttpError(
          409,
          `The username '${data.username}' is already taken.`
        );
      }
      throw error;
    }
  }

  public async deleteUserAccount(userId: string): Promise<void> {
    const user = await User.findById(userId).lean();
    if (!user) {
      logger.warn(
        { userId },
        "Attempted to delete a user that does not exist."
      );
      return;
    }
    const assetsToDelete: Promise<any>[] = [];
    if (user.profileImage) {
      const publicId = `user_assets/profile_${userId}`;
      assetsToDelete.push(deleteFromCloudinary(publicId));
    }
    if (user.bannerImage) {
      const publicId = `user_assets/banner_${userId}`;
      assetsToDelete.push(deleteFromCloudinary(publicId));
    }
    if (assetsToDelete.length > 0) {
      await Promise.allSettled(assetsToDelete);
      logger.info(
        { userId, count: assetsToDelete.length },
        "Deleted user assets from Cloudinary."
      );
    }
    await User.deleteOne({ _id: userId });
    logger.info({ userId }, "User account deleted successfully from database.");
  }

  public async followUser(
    followerId: string,
    usernameToFollow: string
  ): Promise<void> {
    const userToFollow = await User.findOne({
      username: usernameToFollow.toLowerCase(),
    }).lean();

    if (!userToFollow) {
      throw createHttpError(404, "User you are trying to follow not found.");
    }

    if (followerId === userToFollow._id.toString()) {
      throw createHttpError(400, "You cannot follow yourself.");
    }

    // Check if the follow relationship already exists to prevent duplicates
    const existingFollow = await Follow.findOne({
      followerId,
      followingId: userToFollow._id,
    });

    if (existingFollow) {
      // You can either throw an error or just return silently
      logger.warn(
        { followerId, followingId: userToFollow._id },
        "User is already being followed."
      );
      return;
    }

    await Follow.create({
      followerId,
      followingId: userToFollow._id,
    });

    logger.info(
      { followerId, followingId: userToFollow._id },
      "User followed successfully."
    );
  }

  public async unfollowUser(
    followerId: string,
    usernameToUnfollow: string
  ): Promise<void> {
    const userToUnfollow = await User.findOne({
      username: usernameToUnfollow.toLowerCase(),
    }).lean();

    if (!userToUnfollow) {
      throw createHttpError(404, "User you are trying to unfollow not found.");
    }

    const result = await Follow.deleteOne({
      followerId,
      followingId: userToUnfollow._id,
    });

    if (result.deletedCount === 0) {
      logger.warn(
        { followerId, followingId: userToUnfollow._id },
        "Attempted to unfollow a user that was not being followed."
      );
    }

    logger.info(
      { followerId, followingId: userToUnfollow._id },
      "User unfollowed successfully."
    );
  }

  public async getFollowers(username: string) {
    const user = await User.findOne({
      username: username.toLowerCase(),
    }).lean();
    if (!user) {
      throw createHttpError(404, "User not found.");
    }

    const followers = await Follow.find({ followingId: user._id })
      .populate({
        path: "followerId",
        select: "name username profileImage", // Select only the fields needed for the list
      })
      .lean();

    // The result from populate is nested, so we extract just the user object
    return followers.map((follow) => follow.followerId);
  }

  public async getFollowing(username: string) {
    const user = await User.findOne({
      username: username.toLowerCase(),
    }).lean();
    if (!user) {
      throw createHttpError(404, "User not found.");
    }

    const following = await Follow.find({ followerId: user._id })
      .populate({
        path: "followingId",
        select: "name username profileImage",
      })
      .lean();

    // The result from populate is nested, so we extract just the user object
    return following.map((follow) => follow.followingId);
  }
}

export const userService = new UserService();
