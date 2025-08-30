// src/app/(app)/saved-events/page.tsx

"use client";

import SavedEventList from "@/components/pages/saved-events/SavedEventList";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SavedEventsPage() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Saved Events</h1>
        <p className="text-muted-foreground">
          Events you've saved to check out later.
        </p>
      </div>
      <SavedEventList />
    </div>
  );
}
