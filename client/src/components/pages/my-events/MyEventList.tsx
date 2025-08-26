// src/components/pages/my-events/MyEventList.tsx

"use client";

import { useState } from "react";
import { useGetMyEventsQuery } from "@/lib/features/event/eventApiSlice";
import MyEventCard from "./MyEventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CalendarPlus } from "lucide-react";
import Link from "next/link";

export default function MyEventList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useGetMyEventsQuery({
    page,
  });

  const events = data?.data.events || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not fetch your events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold">
          You haven't created any events yet.
        </h3>
        <p className="text-muted-foreground mt-1 mb-4">
          Get started by submitting your first event for approval.
        </p>
        <Button asChild>
          <Link href="/events/create">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Your First Event
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {events.map((event) => (
          <MyEventCard key={event._id} event={event} />
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
          disabled={isFetching || events.length < 10}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
