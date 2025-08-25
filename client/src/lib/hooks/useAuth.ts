// src/lib/hooks/useAuth.ts

"use client";

import { useAppSelector } from "./hooks";

/**
 * A custom hook to conveniently access the current authentication state
 * from anywhere in the component tree. This is the single source of truth
 * for user information in the UI.
 *
 * @returns An object containing the current `user` object (or null if not logged in)
 * and the raw `token` string.
 */
export const useAuth = () => {
  // Select the entire `auth` state slice from the Redux store.
  // This is efficient thanks to Redux's memoization.
  const { user, token } = useAppSelector((state) => state.auth);

  // Directly return the user object and token from the store.
  // This pattern is simpler and more performant than decoding a JWT on each render,
  // and it ensures the user data is always in sync with the state managed by the API slices.
  return { user, token };
};
