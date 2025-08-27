// src/lib/features/map/mapApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import { MapApiResponse } from "./mapTypes";

// Note: Remember to add 'MapPlaces' to the tagTypes array in your main apiSlice.ts
export const mapApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * A lazy query to get geocoding suggestions for a search string.
     * 'Lazy' means it's triggered manually, not on component mount.
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
     * Query to get points of interest near a given location.
     */
    getPlacesNearby: builder.query<
      MapApiResponse,
      { lng: number; lat: number; categories?: string }
    >({
      query: ({ lng, lat, categories }) => {
        const params = new URLSearchParams({
          lng: lng.toString(),
          lat: lat.toString(),
        });
        if (categories) {
          params.append("categories", categories);
        }
        return `/maps/places-nearby?${params.toString()}`;
      },
      providesTags: ["MapPlaces"],
    }),
  }),
});

export const {
  useLazyGeocodeAddressQuery, // Exported as 'lazy' to be triggered on demand
  useGetPlacesNearbyQuery,
} = mapApiSlice;
