//src/features/map/map.service.ts
import axios from "axios";
import { config } from "../../config/index.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";

const searchBoxApi = axios.create({
  baseURL: "https://api.mapbox.com/search/searchbox/v1",
});

export class MapService {
  /**
   * Converts a search string into geographic coordinates using the Search Box API to include POIs.
   */
  async geocodeAddress(
    searchText: string,
    userLongitude?: number,
    userLatitude?: number
  ) {
    try {
      const params: any = {
        q: searchText,
        limit: 7,
        access_token: config.mapbox.apiKey,
      };

      if (userLongitude && userLatitude) {
        params.proximity = `${userLongitude},${userLatitude}`;
      }

      const response = await searchBoxApi.get("/forward", { params });
      return response.data.features;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox Search Box API (forward) error");
      throw createHttpError(500, "Failed to fetch location data.");
    }
  }

  /**
   * Converts geographic coordinates into a human-readable address, including POIs.
   */
  async reverseGeocodeCoordinates(longitude: number, latitude: number) {
    try {
      // ✅ FIX: Changed from `q` to separate `longitude` and `latitude` parameters
      // as required by the /reverse endpoint.
      const params = {
        longitude: longitude,
        latitude: latitude,
        limit: 1,
        types: "address,poi",
        access_token: config.mapbox.apiKey,
      };

      const response = await searchBoxApi.get("/reverse", { params });
      return response.data.features;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox Search Box API (reverse) error");
      throw createHttpError(500, "Failed to fetch address data.");
    }
  }
}

export const mapService = new MapService();
