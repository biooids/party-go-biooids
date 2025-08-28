// src/lib/features/event/eventApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import {
  CreateEventDto,
  UpdateEventDto,
  GetEventsApiResponse,
  GetEventApiResponse,
  GetMyEventsApiResponse,
  GetNearbyEventsApiResponse,
  Event,
} from "./eventTypes";

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches a paginated list of all approved public events.
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
     * Fetches all events created by the currently logged-in user.
     */
    getMyEvents: builder.query<
      GetMyEventsApiResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/events/me?page=${page}&limit=${limit}`,
      providesTags: [{ type: "Events", id: "MY_LIST" }],
    }),

    /**
     * Fetches a single approved event by its ID.
     */
    getEventById: builder.query<GetEventApiResponse, string>({
      query: (eventId) => `/events/${eventId}`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    /**
     * Creates a new event.
     */
    createEvent: builder.mutation<GetEventApiResponse, FormData>({
      query: (body) => ({
        url: "/events",
        method: "POST",
        body,
      }),
      // After creating, invalidate the user's list to show the new pending event.
      invalidatesTags: [{ type: "Events", id: "MY_LIST" }],
    }),

    /**
     * Updates an existing event.
     */
    updateEvent: builder.mutation<Event, { eventId: string; body: FormData }>({
      query: ({ eventId, body }) => ({
        url: `/events/${eventId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Events", id: "LIST" },
        { type: "Events", id: "MY_LIST" },
        { type: "Events", id: eventId },
      ],
    }),

    /**
     * Deletes an event.
     */
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
      }),
      // After deleting, invalidate both lists.
      invalidatesTags: [
        { type: "Events", id: "LIST" },
        { type: "Events", id: "MY_LIST" },
      ],
    }),

    /**
     *  New query to fetch a single event owned by the current user.
     * This is used for the private "My Events" detail page and the edit dialog.
     */
    getMyEventById: builder.query<GetEventApiResponse, string>({
      query: (eventId) => `/events/my/${eventId}`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    /**
     * Resubmits a rejected event for approval.
     */
    resubmitEvent: builder.mutation<Event, string>({
      query: (eventId) => ({
        url: `/events/my/${eventId}/resubmit`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, eventId) => [
        { type: "Events", id: "MY_LIST" },
        { type: "Events", id: eventId },
      ],
    }),

    /**
     * ✅ ADDED: Fetches all approved events within a given radius.
     */
    getNearbyEvents: builder.query<
      GetNearbyEventsApiResponse,
      { lat: number; lng: number; radius?: number }
    >({
      query: (
        { lat, lng, radius = 10000 } // Default radius of 10km
      ) => `/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.events.map(({ _id }) => ({
                type: "Events" as const,
                id: _id,
              })),
              { type: "Events", id: "NEARBY_LIST" },
            ]
          : [{ type: "Events", id: "NEARBY_LIST" }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetNearbyEventsQuery,
  useGetMyEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetMyEventByIdQuery,
  useResubmitEventMutation,
} = eventApiSlice;
