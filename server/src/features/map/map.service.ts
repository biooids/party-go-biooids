// src/features/map/map.service.ts

import axios from "axios";
import { config } from "../../config/index.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";
import { MapboxGeocodingResponse } from "./map.types.js";

const mapboxApi = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  params: {
    access_token: config.mapbox.apiKey,
  },
});

export class MapService {
  /**
   * Converts a search string into geographic coordinates, biasing towards a user's location.
   * @param searchText - The address or place name to search for.
   * @param userLongitude - (Optional) The user's current longitude.
   * @param userLatitude - (Optional) The user's current latitude.
   */
  async geocodeAddress(
    searchText: string,
    userLongitude?: number,
    userLatitude?: number
  ) {
    try {
      const encodedSearchText = encodeURIComponent(searchText);

      const params: any = {
        limit: 5,
      };

      if (userLongitude && userLatitude) {
        params.proximity = `${userLongitude},${userLatitude}`;
      }

      const response = await mapboxApi.get<MapboxGeocodingResponse>(
        `/${encodedSearchText}.json`,
        { params }
      );
      return response.data.features;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox geocoding API error");
      throw createHttpError(500, "Failed to fetch location data.");
    }
  }

  /**
   * Finds points of interest (POIs) near a given set of coordinates.
   * @param longitude - The longitude of the search center.
   * @param latitude - The latitude of the search center.
   * @param categories - (Optional) A comma-separated string of categories to filter by (e.g., "bar,nightclub").
   */
  async findPlacesNearby(
    longitude: number,
    latitude: number,
    categories?: string
  ) {
    try {
      const params: any = {
        types: "poi",
        limit: 25,
      };
      if (categories) {
        params.poi_category = categories;
      }

      const response = await mapboxApi.get<MapboxGeocodingResponse>(
        `/${longitude},${latitude}.json`,
        { params }
      );
      return response.data.features;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox places API error");
      throw createHttpError(500, "Failed to fetch nearby places.");
    }
  }

  /**
   * ✅ ADDED: Converts geographic coordinates into a human-readable address.
   * @param longitude - The longitude of the point.
   * @param latitude - The latitude of the point.
   */
  async reverseGeocodeCoordinates(longitude: number, latitude: number) {
    try {
      const response = await mapboxApi.get<MapboxGeocodingResponse>(
        `/${longitude},${latitude}.json`,
        {
          params: {
            types: "address,poi", // Prioritize addresses and points of interest
            limit: 1, // We only need the top result
          },
        }
      );
      return response.data.features;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox reverse geocoding API error");
      throw createHttpError(500, "Failed to fetch address data.");
    }
  }
}
export const mapService = new MapService();
