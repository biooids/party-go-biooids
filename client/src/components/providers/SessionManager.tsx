//src/components/providers/SessionManager.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLazyRefreshQuery } from "@/lib/features/auth/authApiSlice";

/**
 * A headless client component that proactively manages the user's session.
 * It automatically refreshes the access token when the browser tab
 * is refocused after a period of inactivity. This should be placed
 * once in the root layout.
 */
export default function SessionManager() {
  const { token } = useAuth();
  const [triggerRefresh] = useLazyRefreshQuery();
  const lastRefreshTimestamp = useRef<number>(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Check if the tab is visible and a user is likely logged in
      if (document.visibilityState === "visible" && token) {
        const now = Date.now();
        // Throttle the refresh to run at most once every 60 seconds
        // to prevent excessive API calls.
        if (now - lastRefreshTimestamp.current > 60 * 1000) {
          console.log("Tab refocused, triggering a silent token refresh.");
          triggerRefresh();
          lastRefreshTimestamp.current = now;
        }
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, triggerRefresh]);

  // This component does not render anything to the screen.
  return null;
}
