// src/lib/features/user/userApiSlice.ts

import { apiSlice } from "../../api/apiSlice";
import { setCredentials, loggedOut } from "../auth/authSlice";
import type {
  UserProfileApiResponse,
  ChangePasswordInputDto,
  PublicProfileApiResponse,
} from "./userTypes";
import { SanitizedUserDto } from "../auth/authTypes";
import { RootState } from "@/lib/store";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<UserProfileApiResponse, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    getUserByUsername: builder.query<PublicProfileApiResponse, string>({
      query: (username) => `/users/profile/${username}`,
      providesTags: (result, error, username) => [
        { type: "User", id: username },
      ],
    }),
    getUsersByUsernames: builder.query<
      { data: { users: SanitizedUserDto[] } },
      string[]
    >({
      query: (usernames) => `/users/profiles?usernames=${usernames.join(",")}`,
    }),
    updateProfile: builder.mutation<UserProfileApiResponse, FormData>({
      query: (formData) => ({
        url: "/users/me",
        method: "PATCH",
        body: formData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const currentToken = (getState() as RootState).auth.token;
          if (currentToken) {
            dispatch(
              setCredentials({
                user: data.data.user,
                token: currentToken,
              })
            );
          }
        } catch (error) {
          console.error("Profile update failed:", error);
        }
      },
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<
      { message: string },
      ChangePasswordInputDto
    >({
      query: (credentials) => ({
        url: "/users/me/password",
        method: "PATCH",
        body: credentials,
      }),
    }),
    deleteAccount: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/users/me",
        method: "DELETE",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(loggedOut());
        }
      },
    }),
    followUser: builder.mutation<void, string>({
      query: (username) => ({
        url: `/users/${username}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, username) => [
        { type: "User", id: username },
      ],
    }),
    unfollowUser: builder.mutation<void, string>({
      query: (username) => ({
        url: `/users/${username}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, username) => [
        { type: "User", id: username },
      ],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetUserByUsernameQuery,
  useGetUsersByUsernamesQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApiSlice;
