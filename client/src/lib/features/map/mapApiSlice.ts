// src/lib/features/map/mapApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import { MapApiResponse, MapSuggestionsApiResponse } from "./mapTypes"; // Import the new type

export const mapApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * ✅ ADD THIS NEW QUERY
     * A lazy query to search for Points of Interest (POIs) like clubs and hotels.
     */
    searchPlaces: builder.query<
      MapSuggestionsApiResponse, // Use the new response type for suggestions
      { query: string; lng?: number; lat?: number; categories?: string }
    >({
      query: ({ query, lng, lat, categories }) => {
        const params = new URLSearchParams({ q: query });
        if (lng && lat) {
          params.append("lng", lng.toString());
          params.append("lat", lat.toString());
        }
        if (categories) {
          params.append("categories", categories);
        }
        return `/maps/search?${params.toString()}`;
      },
    }),

    /**
     * A lazy query to get geocoding suggestions for an address.
     */
    geocodeAddress: builder.query<
      MapApiResponse,
      { query: string; lng?: number; lat?: number }
    >({
      query: ({ query, lng, lat }) => {
        const params = new URLSearchParams({ q: query });
        if (lng && lat) {
          params.append("lng", lng.toString());
          params.append("lat", lat.toString());
        }
        return `/maps/geocode?${params.toString()}`;
      },
    }),

    /**
     * A lazy query to convert coordinates into a human-readable address.
     */
    reverseGeocode: builder.query<MapApiResponse, { lng: number; lat: number }>(
      {
        query: ({ lng, lat }) => `/maps/reverse-geocode?lng=${lng}&lat=${lat}`,
      }
    ),

    retrievePlace: builder.query<any, string>({
      query: (mapboxId) => `/maps/retrieve/${mapboxId}`,
    }),
  }),
});

export const {
  useLazySearchPlacesQuery,
  useLazyGeocodeAddressQuery,
  useLazyReverseGeocodeQuery,
  useLazyRetrievePlaceQuery,
} = mapApiSlice;
