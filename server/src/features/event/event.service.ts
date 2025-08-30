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
import { Types } from "mongoose";
import { User } from "../../db/mongo.js";

// Define what fields to return when populating creator info
const creatorPopulation = {
  path: "creatorId",
  select: "name username profileImage",
};

const categoryPopulation = { path: "categoryId", select: "name" };

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

type EventInputDto = CreateEventInputDto & {
  longitude?: number;
  latitude?: number;
};
type EventUpdateDto = UpdateEventInputDto & {
  longitude?: number;
  latitude?: number;
};
export class EventService {
  public async createEvent(
    input: EventInputDto,
    creatorId: string,
    imageFiles: Express.Multer.File[]
  ) {
    let location;

    if (input.latitude && input.longitude) {
      location = {
        type: "Point" as const,
        coordinates: [input.longitude, input.latitude],
      };
    } else {
      // Fallback to geocoding only if coordinates are not provided.
      const geocodingResults = await mapService.geocodeAddress(input.address);
      if (!geocodingResults || geocodingResults.length === 0) {
        throw createHttpError(400, "Could not validate the provided address.");
      }
      const [longitude, latitude] = geocodingResults[0].center;
      location = {
        type: "Point" as const,
        coordinates: [longitude, latitude],
      };
    }

    // Upload images to Cloudinary.
    const uploadPromises = imageFiles.map((file) =>
      uploadToCloudinary(file.buffer, "event_images")
    );
    const uploadResults = await Promise.all(uploadPromises);

    const uploadedImagesData = uploadResults.map((result) => ({
      secure_url: result.secure_url,
      public_id: result.public_id,
    }));
    const imageUrls = uploadedImagesData.map((data) => data.secure_url);

    const qrCodeSecret = crypto.randomBytes(16).toString("hex");

    // Try to create the event in the database.
    try {
      const eventData = {
        ...input,
        creatorId,
        imageUrls,
        location, // Use the determined location object
        qrCodeSecret,
        status: EventStatus.PENDING,
      };
      const event = await Event.create(eventData);
      return event.toObject();
    } catch (error) {
      // If database creation fails, clean up the uploaded images.
      logger.error(
        { err: error },
        "Database error during event creation. Cleaning up Cloudinary assets."
      );

      const deletionPromises = uploadedImagesData.map((data) =>
        deleteFromCloudinary(data.public_id)
      );
      await Promise.allSettled(deletionPromises);
      throw error;
    }
  }

  public async updateEvent(
    eventId: string,
    updateData: EventUpdateDto,
    user: { id: string; systemRole: SystemRole },
    newImageFiles: Express.Multer.File[]
  ) {
    // STEP 1: Fetch original event for checks.
    const originalEvent = await Event.findById(eventId)
      .select("creatorId status imageUrls address")
      .lean();

    if (!originalEvent) {
      throw createHttpError(404, "Event not found.");
    }

    // STEP 2: Perform authorization check.
    if (
      originalEvent.creatorId.toString() !== user.id &&
      user.systemRole !== SystemRole.ADMIN &&
      user.systemRole !== SystemRole.SUPER_ADMIN
    ) {
      throw createHttpError(
        403,
        "You are not authorized to update this event."
      );
    }

    // STEP 3: Handle all image processing.
    const existingImageUrls = updateData.existingImageUrls || [];
    let newUploadedUrls: string[] = [];

    if (newImageFiles && newImageFiles.length > 0) {
      const uploadPromises = newImageFiles.map((file) =>
        uploadToCloudinary(file.buffer, "event_images")
      );
      const uploadResults = await Promise.all(uploadPromises);
      newUploadedUrls = uploadResults.map((result) => result.secure_url);
    }

    const finalImageUrls = [...existingImageUrls, ...newUploadedUrls];

    if (finalImageUrls.length === 0) {
      throw createHttpError(400, "An event must have at least one image.");
    }

    const imagesToDelete = originalEvent.imageUrls.filter(
      (url) => !existingImageUrls.includes(url)
    );

    if (imagesToDelete.length > 0) {
      const deletionPromises = imagesToDelete.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        return publicId ? deleteFromCloudinary(publicId) : Promise.resolve();
      });
      await Promise.allSettled(deletionPromises);
    }

    // STEP 4: Build the update payload object.
    const updatePayload: Record<string, any> = {
      imageUrls: finalImageUrls,
    };

    // Add text fields from the DTO.
    if (updateData.name) updatePayload.name = updateData.name;
    if (updateData.description)
      updatePayload.description = updateData.description;
    if (updateData.date) updatePayload.date = updateData.date;
    if (updateData.price !== undefined) updatePayload.price = updateData.price;
    if (updateData.categoryId) updatePayload.categoryId = updateData.categoryId;

    // ✅ FIX: Prioritize direct coordinates for location updates.
    if (updateData.latitude && updateData.longitude) {
      updatePayload.address = updateData.address; // Still update the address string
      updatePayload.location = {
        type: "Point",
        coordinates: [updateData.longitude, updateData.latitude],
      };
    } else if (
      updateData.address &&
      updateData.address !== originalEvent.address
    ) {
      // Fallback to geocoding only if coordinates aren't sent and address changed.
      const geocodingResults = await mapService.geocodeAddress(
        updateData.address
      );
      if (geocodingResults && geocodingResults.length > 0) {
        updatePayload.address = updateData.address;
        updatePayload.location = {
          type: "Point",
          coordinates: geocodingResults[0].center,
        };
      }
    }

    // Reset status to PENDING if creator edits an approved event.
    const isCreatorEditing = originalEvent.creatorId.toString() === user.id;
    if (originalEvent.status === EventStatus.APPROVED && isCreatorEditing) {
      updatePayload.status = EventStatus.PENDING;
      logger.info(
        { eventId, userId: user.id },
        "Approved event was edited and reset to PENDING."
      );
    }

    // STEP 5: Perform the atomic update.
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      throw createHttpError(404, "Event could not be updated.");
    }

    return updatedEvent.toObject();
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
  /**
   * Finds all events created by a specific user, with pagination.
   * @param creatorId - The ID of the user who created the events.
   */
  public async findEventsByCreator(creatorId: string, page = 1, limit = 10) {
    const events = await Event.find({ creatorId })
      .populate(creatorPopulation)
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

  /**
   * ✅ ADDED: Finds all approved events within a given radius of a geographic point.
   * @param latitude - The latitude of the center point.
   * @param longitude - The longitude of the center point.
   * @param radiusInMeters - The search radius in meters.
   */
  public async findEventsNearby(
    latitude: number,
    longitude: number,
    radiusInMeters: number,
    categoryId?: string
  ) {
    // Define a threshold for what we consider "unlimited". 50,000km is larger than Earth's circumference.
    const UNLIMITED_RADIUS_THRESHOLD = 50000000;

    let filter: any = {
      status: EventStatus.APPROVED,
    };

    // If a specific categoryId is provided, add it to the filter.
    if (categoryId && categoryId !== "all") {
      filter.categoryId = categoryId;
    }

    // ✅ FIX: Check if the radius is effectively unlimited.
    if (radiusInMeters < UNLIMITED_RADIUS_THRESHOLD) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }
    // If the radius is "unlimited", we simply don't add the location filter,
    // thereby searching all events that match the other criteria (status, category).

    const events = await Event.find(filter)
      .populate(creatorPopulation)
      .populate(categoryPopulation)
      .limit(50) // Keep the limit to ensure good performance
      .lean();

    return events;
  }

  public async searchEvents(query: string) {
    const matchingUsers = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("_id"); // We only need their IDs.

    const matchingUserIds = matchingUsers.map(
      (user: { _id: Types.ObjectId }) => user._id
    );

    const searchCondition = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { creatorId: { $in: matchingUserIds } },
      ],
      status: EventStatus.APPROVED,
    };

    const events = await Event.find(searchCondition)
      .populate(creatorPopulation)
      .populate(categoryPopulation)
      .limit(10)
      .lean();

    return events;
  }
}

export const eventService = new EventService();
