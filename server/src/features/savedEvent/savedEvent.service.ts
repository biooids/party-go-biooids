// src/features/savedEvent/savedEvent.service.ts

import SavedEvent from "./savedEvent.model.js";
import Event from "../event/event.model.js";
import { EventStatus } from "../event/event.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";

export class SavedEventService {
  /**
   * Allows a user to save an event.
   */
  async saveEvent(userId: string, eventId: string) {
    // 1. Check if the event exists and is approved
    const event = await Event.findOne({
      _id: eventId,
      status: EventStatus.APPROVED,
    }).lean();

    if (!event) {
      throw createHttpError(404, "Approved event not found.");
    }

    // 2. Check if the user has already saved this event
    const existingSave = await SavedEvent.findOne({ userId, eventId });
    if (existingSave) {
      throw createHttpError(409, "You have already saved this event.");
    }

    // 3. Create the new saved event record
    const savedEvent = await SavedEvent.create({ userId, eventId });
    logger.info({ userId, eventId }, "User saved an event.");
    return savedEvent.toObject();
  }

  /**
   * Allows a user to unsave an event.
   */
  async unsaveEvent(userId: string, eventId: string) {
    const result = await SavedEvent.findOneAndDelete({ userId, eventId });
    if (!result) {
      throw createHttpError(404, "You have not saved this event.");
    }
    logger.info({ userId, eventId }, "User unsaved an event.");
    return { message: "Event unsaved successfully." };
  }

  /**
   * Retrieves all events saved by the current user.
   */
  async getMySavedEvents(userId: string) {
    const savedEvents = await SavedEvent.find({ userId })
      .populate({
        path: "eventId",
        model: "Event",
        populate: {
          path: "categoryId",
          model: "EventCategory",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Return just the populated event details
    return savedEvents.map((se) => se.eventId);
  }
}

export const savedEventService = new SavedEventService();
