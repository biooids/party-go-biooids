// src/components/pages/saved-events/SavedEventList.tsx

"use client";

import { useGetMySavedEventsQuery } from "@/lib/features/savedEvent/savedEventApiSlice";
import EventCard from "@/components/pages/events/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SavedEventList() {
  const { data, isLoading, isError } = useGetMySavedEventsQuery();

  const events = data?.data.events || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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
          Could not fetch your saved events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold">No Saved Events</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          You haven't saved any events yet. Start exploring to find some!
        </p>
        <Button asChild>
          <Link href="/events">
            <Compass className="mr-2 h-4 w-4" />
            Explore Events
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
