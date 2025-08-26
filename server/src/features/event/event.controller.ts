// src/features/event/event.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { eventService } from "./event.service.js";
import { SystemRole } from "../../types/user.types.js";
import { createHttpError } from "../../utils/error.factory.js";

class EventController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const imageFiles = req.files as Express.Multer.File[];
    if (!imageFiles || imageFiles.length === 0) {
      throw createHttpError(400, "At least one event image is required.");
    }

    const creatorId = req.user!.id;
    const event = await eventService.createEvent(
      req.body,
      creatorId,
      imageFiles
    );

    res.status(201).json({
      status: "success",
      message: "Event created successfully and is pending approval.",
      data: { event },
    });
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await eventService.findApprovedEventById(eventId);
    res.status(200).json({
      status: "success",
      data: { event },
    });
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const events = await eventService.findAllApprovedEvents(page, limit);
    res.status(200).json({
      status: "success",
      results: events.length,
      data: { events },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const user = {
      id: req.user!.id,
      systemRole: req.user!.systemRole as SystemRole,
    };
    const updatedEvent = await eventService.updateEvent(
      eventId,
      req.body,
      user
    );
    res.status(200).json({
      status: "success",
      message: "Event updated successfully.",
      data: { event: updatedEvent },
    });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const user = {
      id: req.user!.id,
      systemRole: req.user!.systemRole as SystemRole,
    };
    await eventService.deleteEvent(eventId, user);
    res.status(204).send();
  });

  // Controller to get all events created by the logged-in user
  getMyEvents = asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const events = await eventService.findEventsByCreator(
      creatorId,
      page,
      limit
    );
    res.status(200).json({
      status: "success",
      results: events.length,
      data: { events },
    });
  });

  // Controller to get a single event owned by the logged-in user
  getMyEventById = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const creatorId = req.user!.id;
    const event = await eventService.findMyEventById(eventId, creatorId);
    res.status(200).json({
      status: "success",
      data: { event },
    });
  });

  // Controller to resubmit a rejected event
  resubmitEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const creatorId = req.user!.id;
    const event = await eventService.resubmitEvent(eventId, creatorId);
    res.status(200).json({
      status: "success",
      message: "Event has been resubmitted for approval.",
      data: { event },
    });
  });
}

export const eventController = new EventController();
