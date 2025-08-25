// src/lib/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import persistenceMiddleware from "./middleware/persistenceMiddleware";

// --- Reducer Imports ---
import authReducer from "./features/auth/authSlice";
import uiReducer from "./features/ui/uiSlice";

// --- API Slice Import ---
// CHANGE: Import only the single, central apiSlice.
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    // Regular Redux slices
    auth: authReducer,
    ui: uiReducer,

    // CHANGE: Add only the single reducer from the central apiSlice.
    // All injected endpoints will be handled by this one reducer.
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // CHANGE: Add only the single middleware from the central apiSlice.
  // This one middleware handles all API requests, caching, and invalidation.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(persistenceMiddleware)
      .concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
