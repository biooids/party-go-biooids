// src/lib/api/baseQueryWithReauth.ts

import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import { RootState } from "../store";
import { loggedOut, setCredentials } from "../features/auth/authSlice";

// A dedicated interface for the expected response from the /auth/refresh endpoint.
// This improves type safety and removes the need for `as any`.
interface RefreshApiResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
  };
}

// A mutex is used to ensure that the token refresh process only runs once,
// even if multiple API calls fail with a 401 error at the same time.
const mutex = new Mutex();

// This is the base query function without the re-authentication logic.
// It sets the base URL and prepares the authorization header.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  // 'include' is crucial for sending the httpOnly refresh token cookie to the backend.
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Get the current access token from the Redux store.
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * A wrapper around the base query that adds logic to automatically handle
 * JWT token refreshing. When an API call returns a 401 (Unauthorized) error,
 * it attempts to get a new access token using the refresh token and then
 * retries the original request.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for the mutex to be released before making any API call.
  // This prevents other calls from proceeding while a token refresh is in progress.
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  // Check if the request failed with a 401 Unauthorized error.
  if (result.error && result.error.status === 401) {
    // Check if another request is already trying to refresh the token.
    if (!mutex.isLocked()) {
      // If not, lock the mutex to become the "leader" of the refresh process.
      const release = await mutex.acquire();
      try {
        // Attempt to get a new access token from the /auth/refresh endpoint.
        const refreshResult = await rawBaseQuery(
          { url: "/auth/refresh", method: "POST" },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Type cast the response for safety.
          const { accessToken } = (refreshResult.data as RefreshApiResponse)
            .data;
          // Update the credentials in the Redux store with the new access token.
          api.dispatch(setCredentials({ token: accessToken, user: null }));

          // Retry the original failed request with the new token.
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // If the refresh call itself fails, the session is invalid.
          console.error("Token refresh failed. Logging out.");
          api.dispatch(loggedOut());
        }
      } finally {
        // Release the mutex lock, allowing other queued requests to proceed.
        release();
      }
    } else {
      // If the mutex was already locked, it means another request is refreshing the token.
      // We wait for it to finish and then retry our original request.
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
