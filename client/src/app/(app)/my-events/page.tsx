// src/app/(app)/my-events/page.tsx

"use client";

import MyEventList from "@/components/pages/my-events/MyEventList";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyEventsPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Protect this route by redirecting if the user is not logged in
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Render nothing while redirecting to prevent a flash of content
  if (!token) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
        <p className="text-muted-foreground">
          Manage your created events and view their submission status.
        </p>
      </div>
      <MyEventList />
    </div>
  );
}
