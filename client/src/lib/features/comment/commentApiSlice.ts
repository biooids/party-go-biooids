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
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Comments", id: eventId },
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
      invalidatesTags: (result, error, { commentId }) =>
        result ? [{ type: "Comments", id: result.eventId }] : [],
    }),

    /**
     * Deletes a comment.
     */
    deleteComment: builder.mutation<{ message: string }, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      // This invalidation is more complex, as we don't know the eventId
      // after deletion. Refetching all comments might be necessary.
      // For now, we'll rely on optimistic updates in the UI.
    }),
  }),
});

export const {
  useGetCommentsByEventIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApiSlice;
