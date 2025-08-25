// src/lib/features/auth/authSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SanitizedUserDto } from "./authTypes";

/**
 * Defines the shape of the authentication state in the Redux store.
 */
interface AuthState {
  user: SanitizedUserDto | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Sets the user's credentials in the state upon login or signup.
     * Can also be used to update the token during a refresh.
     */
    setCredentials(
      state,
      action: PayloadAction<{ user: SanitizedUserDto | null; token: string }>
    ) {
      // CHANGE: The action now accepts both a user and a token.
      // If a user object is provided, update it. Otherwise, keep the existing one.
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.token = action.payload.token;
    },
    /**
     * Clears all authentication state upon logout.
     */
    loggedOut(state) {
      // CHANGE: Clear both the user and the token.
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, loggedOut } = authSlice.actions;
export default authSlice.reducer;
