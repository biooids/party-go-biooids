// src/features/map/map.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { mapService } from "./map.service.js";

class MapController {
  /**
   * Controller to handle POI search requests using the Search Box API.
   */
  search = asyncHandler(async (req: Request, res: Response) => {
    const searchText = req.query.q as string;
    const { lng, lat, categories } = req.query;

    const suggestions = await mapService.searchPlaces(
      searchText,
      lng ? Number(lng) : undefined,
      lat ? Number(lat) : undefined,
      categories as string | undefined
    );
    res.status(200).json({ status: "success", data: { suggestions } });
  });

  /**
   * Controller to handle address-to-coordinate geocoding requests.
   */
  geocode = asyncHandler(async (req: Request, res: Response) => {
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
   * Controller to handle coordinate-to-address reverse geocoding requests.
   */
  reverseGeocode = asyncHandler(async (req: Request, res: Response) => {
    const { lng, lat } = req.query;
    const features = await mapService.reverseGeocodeCoordinates(
      Number(lng),
      Number(lat)
    );
    res.status(200).json({ status: "success", data: { features } });
  });

  // Add this method inside the MapController class
  retrieve = asyncHandler(async (req: Request, res: Response) => {
    const { mapboxId } = req.params;
    const details = await mapService.retrievePlaceDetails(mapboxId);
    res.status(200).json({ status: "success", data: { details } });
  });
}

export const mapController = new MapController();
