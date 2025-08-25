// src/components/layouts/AuthInitializer.tsx

"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks/hooks";
import { setCredentials } from "@/lib/features/auth/authSlice";
import storage from "@/lib/utils/storage";
import { Loader2 } from "lucide-react";
import { SanitizedUserDto } from "@/lib/features/auth/authTypes";

/**
 * A component that runs once on application startup to rehydrate the
 * authentication state from localStorage. This prevents the user from
 * being logged out on every page refresh.
 */
export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        // CHANGE: Attempt to load both the user and the token from storage.
        const token = await storage.getItem("authToken");
        const user = await storage.getObject<SanitizedUserDto>("authUser");

        if (token && user) {
          // If both are found, dispatch them to the Redux store to restore the session.
          dispatch(setCredentials({ token, user }));
        }
      } catch (error) {
        console.error("Failed to rehydrate auth state:", error);
      } finally {
        // No matter what, we are done with the initial loading.
        setIsLoading(false);
      }
    };

    rehydrateAuth();
  }, [dispatch]);

  // While checking storage, show a loading spinner to prevent UI flicker.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Once loading is complete, render the rest of the application.
  return <>{children}</>;
}
