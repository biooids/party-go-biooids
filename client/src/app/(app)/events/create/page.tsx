// src/app/(app)/events/create/page.tsx

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useGetMeQuery } from "@/lib/features/user/userApiSlice";
import CreateEventForm from "@/components/pages/events/CreateEventForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function CreateEventPage() {
  const { user: authUser } = useAuth();
  // We refetch the user data to get the latest `isVerifiedCreator` status
  const { data: userData, isLoading } = useGetMeQuery(undefined, {
    skip: !authUser,
  });

  if (isLoading || !authUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-6 pt-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  // Check if the user is a verified creator
  const isVerified = userData?.data.user.isVerifiedCreator;

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center pt-10">
        <Alert variant="destructive" className="max-w-md text-center">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be a verified creator to post a new event. Please contact
            support for verification.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If verified, show the form
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Create a New Event
        </h1>
        <p className="text-muted-foreground">
          Fill out the details below to submit your event for approval.
        </p>
      </div>
      <CreateEventForm />
    </div>
  );
}
