// src/app/(app)/admin/events/page.tsx

"use client";

import { useGetPendingEventsQuery } from "@/lib/features/admin/adminApiSlice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import PendingEventList from "@/components/pages/admin/events/PendingEventList";

export default function AdminEventsPage() {
  const { data, isLoading, isError, error } = useGetPendingEventsQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Event Approval Queue
        </h1>
        {/* Skeleton loader for the list */}
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load pending events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Event Approval Queue
      </h1>
      <p className="text-muted-foreground">
        Review the events below and choose to either approve or reject them.
      </p>
      <PendingEventList events={data?.data.events || []} />
    </div>
  );
}
