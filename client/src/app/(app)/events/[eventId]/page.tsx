// src/app/(app)/events/[eventId]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useGetEventByIdQuery } from "@/lib/features/event/eventApiSlice";
import EventDetailView from "@/components/pages/events/EventDetailView";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const EventDetailSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-64 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
    <div className="space-y-2 pt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { data, isLoading, isError } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (isError || !data?.data.event) {
    return (
      <div className="flex items-center justify-center pt-10">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Event Not Found</AlertTitle>
          <AlertDescription>
            This event could not be found or is no longer available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <EventDetailView event={data.data.event} />;
}
