// src/lib/features/admin/adminApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import type {
  AdminUserView,
  BanUserDto,
  GetAllUsersApiResponse,
  GetPendingEventsApiResponse,
  UpdateUserRoleDto,
} from "./adminTypes";

export const adminApiSlice = apiSlice.injectEndpoints({
  // ✅ Add new tags for managing admin-specific cache.
  overrideExisting: false,
  endpoints: (builder) => ({
    // === User Management Endpoints ===
    getAllUsers: builder.query<GetAllUsersApiResponse, void>({
      query: () => "/admin/users",
      providesTags: ["AdminUsers"],
    }),

    updateUserRole: builder.mutation<
      AdminUserView,
      { userId: string; body: UpdateUserRoleDto }
    >({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PATCH",
        body,
      }),
      // ✅ When a user's role is updated, invalidate the user list to refetch.
      invalidatesTags: ["AdminUsers"],
    }),

    banUser: builder.mutation<
      AdminUserView,
      { userId: string; body: BanUserDto }
    >({
      query: ({ userId, body }) => ({
        url: `/admin/users/${userId}/ban`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    unbanUser: builder.mutation<AdminUserView, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/unban`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // === Event Management Endpoints ===
    getPendingEvents: builder.query<GetPendingEventsApiResponse, void>({
      query: () => "/admin/events/pending",
      providesTags: ["PendingEvents"],
    }),

    approveEvent: builder.mutation<Event, string>({
      query: (eventId) => ({
        url: `/admin/events/${eventId}/approve`,
        method: "PATCH",
      }),
      // ✅ When an event is approved, invalidate the pending list to refetch.
      invalidatesTags: ["PendingEvents"],
    }),

    rejectEvent: builder.mutation<Event, string>({
      query: (eventId) => ({
        url: `/admin/events/${eventId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingEvents"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useBanUserMutation,
  useUnbanUserMutation,
  useDeleteUserMutation,
  useGetPendingEventsQuery,
  useApproveEventMutation,
  useRejectEventMutation,
} = adminApiSlice;
