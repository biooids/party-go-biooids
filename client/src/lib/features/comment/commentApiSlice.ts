// src/lib/features/comment/commentApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import {
  Comment,
  CreateCommentDto,
  GetCommentsApiResponse,
  CreateCommentApiResponse,
} from "./commentTypes";

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches all comments for a specific event.
     */
    getCommentsByEventId: builder.query<GetCommentsApiResponse, string>({
      query: (eventId) => `/events/${eventId}/comments`,
      providesTags: (result, error, eventId) => [
        { type: "Comments", id: eventId },
      ],
    }),

    /**
     * Creates a new comment or reply on an event.
     */
    createComment: builder.mutation<
      CreateCommentApiResponse,
      { eventId: string; body: CreateCommentDto }
    >({
      query: ({ eventId, body }) => ({
        url: `/events/${eventId}/comments`,
        method: "POST",
        body,
      }),
      // ✅ FIXED: Now invalidates both the comment list AND the parent event.
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Comments", id: eventId },
        { type: "Events", id: eventId },
      ],
    }),

    /**
     * Updates an existing comment.
     */
    updateComment: builder.mutation<
      Comment,
      { commentId: string; content: string }
    >({
      query: ({ commentId, content }) => ({
        url: `/comments/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
      // ✅ FIXED: Also invalidates the parent event tag.
      invalidatesTags: (result, error, { commentId }) =>
        result
          ? [
              { type: "Comments", id: result.eventId },
              { type: "Events", id: result.eventId },
            ]
          : [],
    }),

    /**
     * Deletes a comment.
     */
    deleteComment: builder.mutation<
      { message: string },
      { commentId: string; eventId: string }
    >({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      // ✅ FIXED: Also invalidates the parent event tag.
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Comments", id: eventId },
        { type: "Events", id: eventId },
      ],
    }),
  }),
});

export const {
  useGetCommentsByEventIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApiSlice;
