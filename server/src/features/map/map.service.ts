// src/features/map/map.service.ts

import axios from "axios";
import crypto from "crypto"; // Import crypto for session tokens
import { config } from "../../config/index.js";
import { createHttpError } from "../../utils/error.factory.js";
import { logger } from "../../config/logger.js";

const searchApi = axios.create({
  baseURL: "https://api.mapbox.com/search/searchbox/v1",
});

export class MapService {
  /**
   * Converts a search string into geographic coordinates. Primarily for address lookup.
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

      const response = await searchApi.get("/forward", { params });
      return response.data.features;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox Search Box API (forward) error");
      throw createHttpError(500, "Failed to fetch location data.");
    }
  }

  /**
   * Converts geographic coordinates into a human-readable address.
   */
  async reverseGeocodeCoordinates(longitude: number, latitude: number) {
    try {
      const params = {
        longitude: longitude,
        latitude: latitude,
        limit: 1,
        types: "address,poi",
        access_token: config.mapbox.apiKey,
      };

      const response = await searchApi.get("/reverse", { params });
      return response.data.features;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox Search Box API (reverse) error");
      throw createHttpError(500, "Failed to fetch address data.");
    }
  }

  /**
   * Searches for Points of Interest (POIs) like clubs, hotels, etc.,
   * using the Search Box API's suggest endpoint for fast, interactive results.
   */
  async searchPlaces(
    searchText: string,
    userLongitude?: number,
    userLatitude?: number,
    categories?: string
  ) {
    try {
      const params: any = {
        q: searchText,
        access_token: config.mapbox.apiKey,
        session_token: crypto.randomUUID(), // Recommended for billing and analytics
        types: "poi", // Prioritize POIs over addresses
        limit: 7,
      };

      if (userLongitude && userLatitude) {
        params.proximity = `${userLongitude},${userLatitude}`;
      }
      if (categories) {
        params.category = categories;
      }

      const response = await searchApi.get("/suggest", { params });
      // The /suggest endpoint returns a `suggestions` array
      return response.data.suggestions;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox Search Box API (suggest) error");
      throw createHttpError(500, "Failed to fetch place data.");
    }
  }

  async retrievePlaceDetails(mapboxId: string) {
    try {
      const params = {
        access_token: config.mapbox.apiKey,
        session_token: crypto.randomUUID(),
      };
      const response = await searchApi.get(`/retrieve/${mapboxId}`, { params });
      return response.data;
    } catch (error: any) {
      logger.error({ err: error }, "Mapbox Search Box API (retrieve) error");
      throw createHttpError(500, "Failed to retrieve place details.");
    }
  }
}

export const mapService = new MapService();
