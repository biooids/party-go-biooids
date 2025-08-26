// src/app/(app)/my-events/[eventId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetMyEventByIdQuery } from "@/lib/features/event/eventApiSlice";
import MyEventDetailView from "@/components/pages/my-events/MyEventDetailView";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect } from "react";

const EventDetailSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-64 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  </div>
);

export default function MyEventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  const { token } = useAuth();

  // Protect this route
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const { data, isLoading, isError } = useGetMyEventByIdQuery(eventId, {
    skip: !eventId || !token,
  });

  if (!token) {
    return null; // Render nothing while redirecting
  }

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
            This event could not be found or you are not the creator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <MyEventDetailView event={data.data.event} />;
}
