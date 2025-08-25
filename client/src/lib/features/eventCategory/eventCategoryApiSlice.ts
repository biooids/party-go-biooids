// src/lib/features/eventCategory/eventCategoryApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import {
  EventCategory,
  GetAllCategoriesApiResponse,
  CreateCategoryDto,
} from "./eventCategoryTypes";

export const eventCategoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches a list of all available event categories.
     */
    getAllCategories: builder.query<GetAllCategoriesApiResponse, void>({
      query: () => "/event-categories",
      providesTags: (result) =>
        result
          ? [
              ...result.data.categories.map(({ _id }) => ({
                type: "EventCategories" as const,
                id: _id,
              })),
              { type: "EventCategories", id: "LIST" },
            ]
          : [{ type: "EventCategories", id: "LIST" }],
    }),

    /**
     * ✅ ADDED: Creates a new event category. (Admin only)
     */
    createCategory: builder.mutation<EventCategory, CreateCategoryDto>({
      query: (body) => ({
        url: "/event-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "EventCategories", id: "LIST" }],
    }),

    /**
     * ✅ ADDED: Updates an existing event category. (Admin only)
     */
    updateCategory: builder.mutation<
      EventCategory,
      { categoryId: string; body: Partial<CreateCategoryDto> }
    >({
      query: ({ categoryId, body }) => ({
        url: `/event-categories/${categoryId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: "EventCategories", id: categoryId },
        { type: "EventCategories", id: "LIST" },
      ],
    }),

    /**
     * ✅ ADDED: Deletes an event category. (Admin only)
     */
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (categoryId) => ({
        url: `/event-categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "EventCategories", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = eventCategoryApiSlice;
