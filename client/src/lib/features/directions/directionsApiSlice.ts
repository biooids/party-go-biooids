//src/lib/features/directions/directionsApiSlice.ts
import { apiSlice } from "../../api/apiSlice";
import { DirectionsApiResponse, GetDirectionsArgs } from "./directionsTypes";

export const directionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * A lazy query to fetch route directions. 'Lazy' means it's triggered
     * manually (e.g., on a button click), not on component mount.
     */
    getDirections: builder.query<DirectionsApiResponse, GetDirectionsArgs>({
      query: ({ start, end, profile = "driving" }) => {
        const startCoords = `${start.lng},${start.lat}`;
        const endCoords = `${end.lng},${end.lat}`;
        return `/directions?start=${startCoords}&end=${endCoords}&profile=${profile}`;
      },
      providesTags: ["Directions"],
    }),
  }),
});

// Export the lazy query hook for use in components.
export const { useLazyGetDirectionsQuery } = directionsApiSlice;
