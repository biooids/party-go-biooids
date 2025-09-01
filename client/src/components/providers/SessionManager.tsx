//script/client/src/components/providers/SessionManager.tsx

"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLazyRefreshQuery } from "@/lib/features/auth/authApiSlice";
import { useRouter } from "next/navigation";

/**
 * A headless client component that manages the user's session.
 * - Proactively refreshes the access token on tab focus.
 * - Automatically redirects the user to the homepage on logout.
 * This should be placed once in the root layout.
 */
export default function SessionManager() {
  const { token } = useAuth();
  const [triggerRefresh] = useLazyRefreshQuery();
  const router = useRouter(); // ✅ 2. Initialize the router
  const lastRefreshTimestamp = useRef<number>(Date.now());

  // ✅ 3. Add logic to watch for logout and redirect
  const previousTokenRef = useRef(token);
  useEffect(() => {
    // If the token existed before but is null now, the user has logged out.
    if (previousTokenRef.current && !token) {
      router.push("/"); // Redirect to the homepage
    }
    // Update the ref for the next render.
    previousTokenRef.current = token;
  }, [token, router]);

  // This effect handles the proactive token refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && token) {
        const now = Date.now();
        if (now - lastRefreshTimestamp.current > 60 * 1000) {
          console.log("Tab refocused, triggering a silent token refresh.");
          triggerRefresh();
          lastRefreshTimestamp.current = now;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, triggerRefresh]);

  return null;
}
