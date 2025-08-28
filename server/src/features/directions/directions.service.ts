//src/features/directions/directions.service.ts
import axios from "axios";
import { config } from "../../config/index.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";

type TravelProfile = "driving" | "walking" | "cycling";

export class DirectionsService {
  /**
   * Fetches route data from the Mapbox Directions API.
   * @param startCoords - Starting [longitude, latitude].
   * @param endCoords - Ending [longitude, latitude].
   * @param profile - The travel mode (e.g., 'driving').
   */
  async getDirections(
    startCoords: [number, number],
    endCoords: [number, number],
    profile: TravelProfile
  ) {
    const [startLng, startLat] = startCoords;
    const [endLng, endLat] = endCoords;

    const coordinates = `${startLng},${startLat};${endLng},${endLat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}`;

    try {
      const response = await axios.get(url, {
        params: {
          access_token: config.mapbox.apiKey,
          geometries: "geojson", // Important: returns the route line as a GeoJSON object
          overview: "full", // Returns the most detailed route line
        },
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          // The GeoJSON LineString to draw on the map
          geometry: route.geometry,
          // Travel duration in seconds
          duration: route.duration,
          // Travel distance in meters
          distance: route.distance,
        };
      }
      return null;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox Directions API error");
      throw createHttpError(500, "Failed to fetch directions.");
    }
  }
}

export const directionsService = new DirectionsService();
