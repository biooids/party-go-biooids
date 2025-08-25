// src/lib/features/verificationRequest/verificationRequestApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import {
  CreateVerificationRequestDto,
  VerificationRequest,
  VerificationRequestApiResponse,
} from "./verificationRequestTypes";

// The shape for the new /me endpoint
interface GetMyVerificationRequestApiResponse {
  status: string;
  data: {
    request: VerificationRequest | null;
  };
}

export const verificationRequestApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Query for a user to get the status of their own request.
     */
    getMyVerificationRequest: builder.query<
      GetMyVerificationRequestApiResponse,
      void
    >({
      query: () => "/verification-requests/me",
      providesTags: ["VerificationRequest"], // This is now valid
    }),

    /**
     * Mutation for a user to submit a request to become a verified creator.
     */
    submitVerificationRequest: builder.mutation<
      VerificationRequestApiResponse,
      CreateVerificationRequestDto
    >({
      query: (body) => ({
        url: "/verification-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "VerificationRequest"],
    }),
  }),
});

export const {
  useSubmitVerificationRequestMutation,
  useGetMyVerificationRequestQuery,
} = verificationRequestApiSlice;
