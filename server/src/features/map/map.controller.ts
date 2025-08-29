//src/features/map/map.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { mapService } from "./map.service.js";

class MapController {
  /**
   * Controller to handle geocoding requests.
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
   * ✅ The getPlacesNearby function has been removed as it's now obsolete.
   */

  reverseGeocode = asyncHandler(async (req: Request, res: Response) => {
    const { lng, lat } = req.query;
    const features = await mapService.reverseGeocodeCoordinates(
      Number(lng),
      Number(lat)
    );
    res.status(200).json({ status: "success", data: { features } });
  });
}

export const mapController = new MapController();
