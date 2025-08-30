// src/components/pages/events/EventList.tsx

"use client";

import { useState } from "react";
import {
  useGetEventsQuery,
  useGetNearbyEventsQuery,
} from "@/lib/features/event/eventApiSlice";
import EventCard from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// ✅ 1. Add a location prop to the component to receive coordinates.
interface EventListProps {
  location?: {
    longitude: number;
    latitude: number;
  };
}

export default function EventList({ location }: EventListProps) {
  const [page, setPage] = useState(1);

  // ✅ 2. Conditionally choose which hook to use based on the presence of the location prop.
  const genericEventsQuery = useGetEventsQuery({ page }, { skip: !!location });
  const nearbyEventsQuery = useGetNearbyEventsQuery(
    { lng: location?.longitude ?? 0, lat: location?.latitude ?? 0 },
    { skip: !location }
  );

  // ✅ 3. Determine which data and loading states to use from the active query.
  const { data, isLoading, isError, isFetching } = location
    ? nearbyEventsQuery
    : genericEventsQuery;

  const events = data?.data.events || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not fetch events. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold">No Events Found</h3>
        <p className="text-muted-foreground">
          {location
            ? "Try expanding your search radius or searching a different area."
            : "Check back later for new events."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      {/* ✅ 4. Only show pagination if we are not in a location-specific search. */}
      {!location && (
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
            disabled={isFetching || events.length < 10}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
