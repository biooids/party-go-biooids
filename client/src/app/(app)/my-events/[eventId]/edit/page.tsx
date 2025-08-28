// src/app/(app)/my-events/[eventId]/edit/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetMyEventByIdQuery } from "@/lib/features/event/eventApiSlice";
import EditEventForm from "@/components/pages/my-events/EditEventForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect } from "react";

const EditPageSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-6 w-3/4" />
    <div className="space-y-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  </div>
);

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  const { data, isLoading, isError } = useGetMyEventByIdQuery(eventId, {
    skip: !eventId || !token,
  });

  if (isLoading || !token) {
    return <EditPageSkeleton />;
  }

  if (isError || !data?.data.event) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load event data to edit. You may not be the creator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground">
          Update the details for your event. Changes to an approved event will
          require re-approval.
        </p>
      </div>
      <EditEventForm event={data.data.event} />
    </div>
  );
}
