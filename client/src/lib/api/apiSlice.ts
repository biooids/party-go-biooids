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
  // ✅ FIXED: Added the new tags for event and category data.
  tagTypes: [
    "User",
    "AdminUsers",
    "PendingEvents",
    "Events",
    "EventCategories",
  ],
  endpoints: (builder) => ({}),
});
