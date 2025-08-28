//src/features/directions/directions.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { directionsService } from "./directions.service.js";
import { createHttpError } from "../../utils/error.factory.js";

class DirectionsController {
  get = asyncHandler(async (req: Request, res: Response) => {
    const { start, end, profile } = req.query;

    const startCoords = (start as string).split(",").map(Number) as [
      number,
      number
    ];
    const endCoords = (end as string).split(",").map(Number) as [
      number,
      number
    ];

    const route = await directionsService.getDirections(
      startCoords,
      endCoords,
      profile as "driving" | "walking" | "cycling"
    );

    if (!route) {
      throw createHttpError(404, "No route found between these points.");
    }

    res.status(200).json({ status: "success", data: { route } });
  });
}

export const directionsController = new DirectionsController();
