// src/features/map/map.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { mapService } from "./map.service.js";

class MapController {
  /**
   * Controller to handle geocoding requests.
   */
  geocode = asyncHandler(async (req: Request, res: Response) => {
    // ✅ ADDED: Read optional lng and lat from the query.
    const searchText = req.query.q as string;
    const { lng, lat } = req.query;

    const features = await mapService.geocodeAddress(
      searchText,
      lng ? Number(lng) : undefined,
      lat ? Number(lat) : undefined
    );
    res.status(200).json({ status: "success", data: { features } });
  });

  /**
   * Controller to handle finding nearby places.
   */
  getPlacesNearby = asyncHandler(async (req: Request, res: Response) => {
    const { lng, lat, categories } = req.query;
    const features = await mapService.findPlacesNearby(
      Number(lng),
      Number(lat),
      categories as string | undefined
    );
    res.status(200).json({ status: "success", data: { features } });
  });
}

export const mapController = new MapController();
