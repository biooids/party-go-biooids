// src/features/verificationRequest/verificationRequest.service.ts

import VerificationRequest from "./verificationRequest.model.js";
import { CreateVerificationRequestDto } from "./verificationRequest.types.js";
import { User } from "../../db/mongo.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";

export class VerificationRequestService {
  /**
   * Creates a new verification request for a user.
   * @param input - The data for the request, containing the user's reason.
   * @param userId - The ID of the user making the request.
   */
  async createRequest(input: CreateVerificationRequestDto, userId: string) {
    // Check 1: See if the user is already a verified creator.
    const user = await User.findById(userId).lean();
    if (user?.isVerifiedCreator) {
      throw createHttpError(400, "You are already a verified creator.");
    }

    // Check 2: See if the user already has a pending or approved request.
    const existingRequest = await VerificationRequest.findOne({
      userId,
    }).lean();
    if (existingRequest) {
      throw createHttpError(
        409,
        `You already have a request with '${existingRequest.status}' status.`
      );
    }

    // If checks pass, create the new request with the new data.
    const newRequest = await VerificationRequest.create({
      userId,
      reason: input.reason,
      location: input.location, // ✅ ADDED
      preferredCategories: input.preferredCategories, // ✅ ADDED
    });

    logger.info(
      { userId, requestId: newRequest._id },
      "New verification request submitted."
    );
    return newRequest.toObject();
  }

  /**
   * Finds a verification request by the user ID of the person who created it.
   * @param userId - The ID of the user.
   */
  async findRequestByUserId(userId: string) {
    // Find the request and return it. It's okay if it's null (user hasn't applied).
    const request = await VerificationRequest.findOne({ userId }).lean();
    return request;
  }
}

export const verificationRequestService = new VerificationRequestService();
