// src/components/pages/events/EventList.tsx

"use client";

import { useState } from "react";
import { useGetEventsQuery } from "@/lib/features/event/eventApiSlice";
import EventCard from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function EventList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useGetEventsQuery({ page });

  const events = data?.data.events || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not fetch events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold">No Events Found</h3>
        <p className="text-muted-foreground">
          Check back later for new events in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          // Disable if we're fetching or if the last fetched page had less than 10 items
          disabled={isFetching || events.length < 10}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
