// src/lib/features/savedEvent/savedEventApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import { GetMySavedEventsApiResponse } from "./savedEventTypes";

export const savedEventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Query to get all events saved by the currently logged-in user.
     */
    getMySavedEvents: builder.query<GetMySavedEventsApiResponse, void>({
      query: () => "/saved-events/me",
      providesTags: ["SavedEvents"],
    }),

    /**
     * Mutation to save an event.
     */
    saveEvent: builder.mutation<void, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/save`,
        method: "POST",
      }),
      // ✅ FIXED: Invalidate the specific event's cache tag.
      // This forces a refetch on the EventDetailView and EventCard.
      invalidatesTags: (result, error, eventId) => [
        "SavedEvents",
        { type: "Events", id: eventId },
      ],
    }),

    /**
     * Mutation to unsave an event.
     */
    unsaveEvent: builder.mutation<void, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/save`,
        method: "DELETE",
      }),
      // ✅ FIXED: Invalidate the specific event's cache tag here as well.
      invalidatesTags: (result, error, eventId) => [
        "SavedEvents",
        { type: "Events", id: eventId },
      ],
    }),
  }),
});

export const {
  useGetMySavedEventsQuery,
  useSaveEventMutation,
  useUnsaveEventMutation,
} = savedEventApiSlice;
