// src/lib/hooks/useDebounce.ts

"use client";

import { useState, useEffect } from "react";

/**
 * A custom React hook that debounces a value.
 * It's useful for delaying an action (like an API call) until the user has stopped typing.
 *
 * @param value The value to debounce (e.g., a search term from an input).
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value, which only updates after the delay has passed.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer that will update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This is the key to debouncing: the cleanup function clears the previous timer
    // if the `value` changes before the delay has passed.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // This effect re-runs only if the `value` or `delay` changes.

  return debouncedValue;
}
