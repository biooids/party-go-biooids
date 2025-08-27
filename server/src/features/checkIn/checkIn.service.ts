// src/features/checkIn/checkIn.service.ts

import { User, Event, CheckIn } from "../../db/mongo.js";
import { EventStatus } from "../event/event.types.js";
import { CheckInDto } from "./checkIn.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";

const XP_PER_CHECK_IN = 10; // Define the amount of XP to award

export class CheckInService {
  /**
   * Processes a user's check-in attempt at an event.
   * @param input - The check-in data containing eventId and the QR code secret.
   * @param userId - The ID of the user attempting to check in.
   */
  async checkInUser(input: CheckInDto, userId: string) {
    const { eventId, qrCodeSecret } = input;

    // 1. Find the event and ensure it's currently approved and active.
    const event = await Event.findById(eventId).lean();
    if (!event || event.status !== EventStatus.APPROVED) {
      throw createHttpError(404, "Active event not found.");
    }

    // 2. Security Check: Validate the QR code secret.
    if (event.qrCodeSecret !== qrCodeSecret) {
      throw createHttpError(400, "Invalid or expired QR code.");
    }

    // 3. Security Check: Prevent duplicate check-ins.
    const existingCheckIn = await CheckIn.findOne({ userId, eventId }).lean();
    if (existingCheckIn) {
      throw createHttpError(409, "You have already checked into this event.");
    }

    // 4. If all checks pass, log the check-in and award XP.
    await CheckIn.create({ userId, eventId });
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: XP_PER_CHECK_IN } },
      { new: true } // Return the updated user document
    ).lean();

    if (!updatedUser) {
      // This case is unlikely but handled for safety.
      throw createHttpError(404, "User not found.");
    }

    logger.info(
      { userId, eventId, xpAwarded: XP_PER_CHECK_IN },
      "User successfully checked into event."
    );

    return {
      message: `Successfully checked in! You've earned ${XP_PER_CHECK_IN} XP.`,
      newXpTotal: updatedUser.xp,
    };
  }
}

export const checkInService = new CheckInService();
