// src/features/savedEvent/savedEvent.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { savedEventService } from "./savedEvent.service.js";

class SavedEventController {
  saveEvent = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const savedEvent = await savedEventService.saveEvent(userId, eventId);

    res.status(201).json({
      status: "success",
      message: "Event saved successfully.",
      data: { savedEvent },
    });
  });

  unsaveEvent = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { eventId } = req.params;
    await savedEventService.unsaveEvent(userId, eventId);

    res.status(204).send();
  });

  getMySavedEvents = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const events = await savedEventService.getMySavedEvents(userId);

    res.status(200).json({
      status: "success",
      results: events.length,
      data: { events },
    });
  });
}

export const savedEventController = new SavedEventController();
