// src/lib/api/apiSlice.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

/**
 * The central, empty API slice.
 * Endpoints will be injected into this slice from feature-specific API slices
 * using the `injectEndpoints` method. This keeps the API definitions modular.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "AdminUsers",
    "PendingEvents",
    "Events",
    "EventCategories",
    "PendingVerificationRequests",
    "VerificationRequest",
    "SavedEvents",
    "Comments",
    "MapPlaces",
  ],
  endpoints: (builder) => ({}),
});
