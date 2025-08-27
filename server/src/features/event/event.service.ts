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
import SavedEvent from "../savedEvent/savedEvent.model.js";
import { mapService } from "../map/map.service.js";
import crypto from "crypto";

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
  /**
   * Creates a new event with a 'PENDING' status, multiple images, and geocoded location.
   */
  /**
   * Creates a new event with a 'PENDING' status, multiple images, and a unique QR code secret.
   */
  public async createEvent(
    input: CreateEventInputDto,
    creatorId: string,
    imageFiles: Express.Multer.File[]
  ) {
    // 1. Geocode the address to get coordinates.
    const geocodingResults = await mapService.geocodeAddress(input.address);
    if (!geocodingResults || geocodingResults.length === 0) {
      throw createHttpError(400, "Could not validate the provided address.");
    }
    const [longitude, latitude] = geocodingResults[0].center;
    const location = {
      type: "Point" as const,
      coordinates: [longitude, latitude],
    };

    // 2. Upload images to Cloudinary.
    const uploadPromises = imageFiles.map((file) =>
      uploadToCloudinary(file.buffer, "event_images")
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    const qrCodeSecret = crypto.randomBytes(16).toString("hex");

    // 3. Create the event with all data.
    const eventData = {
      ...input,
      creatorId,
      imageUrls,
      location,
      qrCodeSecret, // ✅ Add the new secret to the event data
      status: EventStatus.PENDING,
    };

    const event = await Event.create(eventData);
    return event.toObject();
  }
  /**
   * Finds a single event by its ID, but only if it is approved.
   */
  public async findApprovedEventById(eventId: string, userId?: string) {
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

    // If a user is logged in, check if they have saved this event.
    let isSaved = false;
    if (userId) {
      const savedEvent = await SavedEvent.findOne({
        eventId: event._id,
        userId,
      }).lean();
      if (savedEvent) {
        isSaved = true;
      }
    }

    // Add the isSaved flag to the returned object
    return { ...event, isSaved };
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
  /**
   * Updates an event. Only the creator or an admin can perform this action.
   * If an approved event is edited, it is set back to pending for re-approval.
   */
  /**
   * Updates an event. If the address is changed, it re-geocodes the location.
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

    // ✅ ADDED: If the address is being updated, fetch new coordinates.
    if (updateData.address && updateData.address !== event.address) {
      const geocodingResults = await mapService.geocodeAddress(
        updateData.address
      );
      if (geocodingResults && geocodingResults.length > 0) {
        const [longitude, latitude] = geocodingResults[0].center;
        event.location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      }
    }

    const wasApproved = event.status === EventStatus.APPROVED;
    const isCreatorEditing = event.creatorId.toString() === user.id;

    if (wasApproved && isCreatorEditing) {
      event.status = EventStatus.PENDING;
      logger.info(
        { eventId, userId: user.id },
        "Approved event was edited and reset to PENDING."
      );
    }

    // Apply all other text-based updates
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

  /**
   * Finds all events created by a specific user, with pagination.
   * @param creatorId - The ID of the user who created the events.
   */
  public async findEventsByCreator(creatorId: string, page = 1, limit = 10) {
    const events = await Event.find({ creatorId })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 }) // Show newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return events;
  }

  /**
   * Finds a single event by its ID, but only if the requester is the creator.
   * Does not check for status, allowing creators to view their pending/rejected events.
   * @param eventId - The ID of the event to find.
   * @param creatorId - The ID of the user requesting the event.
   */
  public async findMyEventById(eventId: string, creatorId: string) {
    const event = await Event.findOne({
      _id: eventId,
      creatorId: creatorId, // Security check: user must be the creator
    })
      .populate("categoryId", "name")
      .lean();

    if (!event) {
      throw createHttpError(404, "Event not found or you are not the creator.");
    }
    return event;
  }

  /**
   * Resubmits a rejected event for approval by setting its status back to PENDING.
   * @param eventId - The ID of the event to resubmit.
   * @param creatorId - The ID of the user performing the action.
   */
  public async resubmitEvent(eventId: string, creatorId: string) {
    const event = await Event.findOne({ _id: eventId, creatorId });
    if (!event) {
      throw createHttpError(404, "Event not found or you are not the creator.");
    }

    if (event.status !== EventStatus.REJECTED) {
      throw createHttpError(
        400,
        `Only rejected events can be resubmitted. This event's status is '${event.status}'.`
      );
    }

    event.status = EventStatus.PENDING;
    await event.save();

    logger.info(
      { eventId, userId: creatorId },
      "Event resubmitted for approval."
    );
    return event.toObject();
  }
}

export const eventService = new EventService();
