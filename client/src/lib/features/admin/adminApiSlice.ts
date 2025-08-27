// src/lib/features/admin/adminApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import type {
  AdminUserView,
  BanUserDto,
  GetAllUsersApiResponse,
  GetPendingEventsApiResponse,
  UpdateUserRoleDto,
} from "./adminTypes";
import { VerificationRequest } from "../verificationRequest/verificationRequestTypes";

// Define the response type for the new endpoint
interface GetPendingVerificationRequestsApiResponse {
  status: string;
  data: {
    requests: VerificationRequest[];
  };
}

export const adminApiSlice = apiSlice.injectEndpoints({
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
      invalidatesTags: ["PendingEvents"],
    }),
    rejectEvent: builder.mutation<Event, string>({
      query: (eventId) => ({
        url: `/admin/events/${eventId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingEvents"],
    }),

    // ✅ ADDED: New endpoints for verification management
    // === Verification Management Endpoints ===
    getPendingVerificationRequests: builder.query<
      GetPendingVerificationRequestsApiResponse,
      void
    >({
      query: () => "/admin/verification-requests",
      providesTags: ["PendingVerificationRequests"],
    }),

    approveVerificationRequest: builder.mutation<VerificationRequest, string>({
      query: (requestId) => ({
        url: `/admin/verification-requests/${requestId}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingVerificationRequests", "AdminUsers"],
    }),

    rejectVerificationRequest: builder.mutation<VerificationRequest, string>({
      query: (requestId) => ({
        url: `/admin/verification-requests/${requestId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingVerificationRequests"],
    }),

    revokeCreatorStatus: builder.mutation<AdminUserView, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/revoke-creator`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminUsers"],
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
  useGetPendingVerificationRequestsQuery,
  useApproveVerificationRequestMutation,
  useRejectVerificationRequestMutation,
  useRevokeCreatorStatusMutation, // ✅ Export the new hook
} = adminApiSlice;
