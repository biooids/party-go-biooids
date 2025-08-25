// src/features/event/event.service.ts

import Event, { EventStatus } from "./event.model.js";
import { CreateEventInputDto, UpdateEventInputDto } from "./event.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { SystemRole } from "../../types/user.types.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary.js";
import { logger } from "../../config/logger.js";

// Define what fields to return when populating creator info
const creatorPopulation = {
  path: "creatorId",
  select: "name username profileImage",
};

// Helper function to extract the public_id from a full Cloudinary URL
const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;
    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
  } catch (error) {
    logger.error(
      { err: error, url },
      "Failed to parse public_id from Cloudinary URL"
    );
    return null;
  }
};

export class EventService {
  /**
   * Creates a new event with a 'PENDING' status and multiple images.
   */
  public async createEvent(
    input: CreateEventInputDto,
    creatorId: string,
    imageFiles: Express.Multer.File[]
  ) {
    // ✅ Upload all images to Cloudinary in parallel for efficiency.
    const uploadPromises = imageFiles.map((file) =>
      uploadToCloudinary(file.buffer, "event_images")
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    const eventData = {
      ...input,
      creatorId,
      imageUrls,
      status: EventStatus.PENDING,
    };

    const event = await Event.create(eventData);
    return event.toObject();
  }

  /**
   * Finds a single event by its ID, but only if it is approved.
   */
  public async findApprovedEventById(eventId: string) {
    const event = await Event.findOne({
      _id: eventId,
      status: EventStatus.APPROVED,
    })
      .populate(creatorPopulation)
      .populate("categoryId", "name")
      .lean();

    if (!event) {
      throw createHttpError(404, "Event not found or not approved.");
    }
    return event;
  }

  /**
   * Finds all approved events, with pagination.
   */
  public async findAllApprovedEvents(page = 1, limit = 10) {
    const events = await Event.find({ status: EventStatus.APPROVED })
      .populate(creatorPopulation)
      .populate("categoryId", "name")
      .sort({ date: 1 }) // Show upcoming events first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return events;
  }

  /**
   * Updates an event. Only the creator or an admin can perform this action.
   */
  public async updateEvent(
    eventId: string,
    updateData: UpdateEventInputDto,
    user: { id: string; systemRole: SystemRole }
  ) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, "Event not found.");
    }

    // Permission check: Must be the creator or an admin.
    if (
      event.creatorId.toString() !== user.id &&
      user.systemRole !== SystemRole.ADMIN &&
      user.systemRole !== SystemRole.SUPER_ADMIN
    ) {
      throw createHttpError(
        403,
        "You are not authorized to update this event."
      );
    }

    Object.assign(event, updateData);
    await event.save();
    return event.toObject();
  }

  /**
   * Deletes an event and all its associated images from Cloudinary.
   */
  public async deleteEvent(
    eventId: string,
    user: { id: string; systemRole: SystemRole }
  ) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, "Event not found.");
    }

    // Permission check: Must be the creator or an admin.
    if (
      event.creatorId.toString() !== user.id &&
      user.systemRole !== SystemRole.ADMIN &&
      user.systemRole !== SystemRole.SUPER_ADMIN
    ) {
      throw createHttpError(
        403,
        "You are not authorized to delete this event."
      );
    }

    // ✅ Loop through the imageUrls array and delete all associated images.
    if (event.imageUrls && event.imageUrls.length > 0) {
      const deletionPromises = event.imageUrls.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        return publicId ? deleteFromCloudinary(publicId) : Promise.resolve();
      });
      // Use Promise.allSettled to ensure we try to delete all images
      // even if one fails.
      await Promise.allSettled(deletionPromises);
      logger.info(
        { eventId },
        "Attempted deletion of all event images from Cloudinary."
      );
    }

    await Event.findByIdAndDelete(eventId);
    return { message: "Event deleted successfully." };
  }
}

export const eventService = new EventService();
