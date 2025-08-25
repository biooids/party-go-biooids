// src/lib/features/auth/authApiSlice.ts

import { apiSlice } from "../../api/apiSlice"; // CHANGE: Import the central apiSlice.
import { loggedOut, setCredentials } from "./authSlice";
import type {
  LoginInputDto,
  SignUpInputDto,
  LoginApiResponse,
} from "./authTypes";

// Use `injectEndpoints` to add the authentication endpoints to the root API slice.
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginApiResponse, LoginInputDto>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.data.user,
              token: data.data.accessToken,
            })
          );
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
    signup: builder.mutation<LoginApiResponse, SignUpInputDto>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.data.user,
              token: data.data.accessToken,
            })
          );
        } catch (error) {
          console.error("Signup failed:", error);
        }
      },
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(loggedOut());
        }
      },
    }),

    refresh: builder.query<void, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useLazyRefreshQuery,
} = authApiSlice;
