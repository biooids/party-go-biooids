import { apiSlice } from "../../api/apiSlice";
import { MapApiResponse } from "./mapTypes";

export const mapApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * A lazy query to get geocoding suggestions for a search string.
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
  }),
});

export const { useLazyGeocodeAddressQuery, useLazyReverseGeocodeQuery } =
  mapApiSlice;
