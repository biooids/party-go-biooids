// src/lib/features/checkIn/checkInApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import { CheckInDto, CheckInApiResponse } from "./checkInTypes";

export const checkInApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Mutation for a user to check into an event using a QR code secret.
     */
    checkIn: builder.mutation<CheckInApiResponse, CheckInDto>({
      query: (body) => ({
        url: "/check-in",
        method: "POST",
        body,
      }),
      /**
       * After a successful check-in, the user's XP changes.
       * We must invalidate the "User" tag to force a refetch of their
       * main profile data (`/users/me`), ensuring the XP updates everywhere.
       */
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useCheckInMutation } = checkInApiSlice;
