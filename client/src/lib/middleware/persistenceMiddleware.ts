// src/lib/middleware/persistenceMiddleware.ts

import { Middleware } from "@reduxjs/toolkit";
import { setCredentials, loggedOut } from "../features/auth/authSlice";
import storage from "../utils/storage";

/**
 * A Redux middleware that persists the authentication state to localStorage.
 * It listens for specific actions (`setCredentials`, `loggedOut`) and updates
 * storage accordingly, ensuring the user's session can survive a page refresh.
 */
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // Allow the action to proceed to the reducers first.
  const result = next(action);

  // After the state has been updated, handle the persistence side-effect.
  if (setCredentials.match(action)) {
    const { token, user } = action.payload;
    if (token && user) {
      // CHANGE: Store both the token and the user object.
      storage.setItem("authToken", token);
      storage.setObject("authUser", user);
    }
  }

  if (loggedOut.match(action)) {
    // CHANGE: Remove both items on logout.
    storage.removeItem("authToken");
    storage.removeItem("authUser");
  }

  return result;
};

export default persistenceMiddleware;
