// src/lib/features/event/eventApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import {
  GetEventsApiResponse,
  GetEventApiResponse,
  UpdateEventDto,
  Event,
} from "./eventTypes";

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches a paginated list of all approved events.
     */
    getEvents: builder.query<
      GetEventsApiResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/events?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.events.map(({ _id }) => ({
                type: "Events" as const,
                id: _id,
              })),
              { type: "Events", id: "LIST" },
            ]
          : [{ type: "Events", id: "LIST" }],
    }),

    /**
     * Fetches a single approved event by its ID.
     */
    getEventById: builder.query<GetEventApiResponse, string>({
      query: (eventId) => `/events/${eventId}`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    /**
     * Creates a new event. Requires user to be a verified creator.
     */
    // ✅ FIXED: The mutation now expects FormData as its input.
    createEvent: builder.mutation<Event, FormData>({
      query: (body) => ({
        url: "/events",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Events", id: "LIST" }],
    }),

    /**
     * Updates an existing event. Requires user to be the creator or an admin.
     */
    updateEvent: builder.mutation<
      Event,
      { eventId: string; body: UpdateEventDto }
    >({
      query: ({ eventId, body }) => ({
        url: `/events/${eventId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Events", id: "LIST" },
        { type: "Events", id: eventId },
      ],
    }),

    /**
     * Deletes an event. Requires user to be the creator or an admin.
     */
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Events", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApiSlice;
