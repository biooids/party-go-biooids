"use client";

import { useEffect } from "react"; // ✅ 1. Import useEffect and useRouter
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGetMeQuery } from "@/lib/features/user/userApiSlice";
import CreateEventForm from "@/components/pages/events/CreateEventForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { SystemRole } from "@/lib/features/auth/authTypes";

export default function CreateEventPage() {
  const { user: authUser, token } = useAuth();
  const router = useRouter(); // ✅ 2. Initialize the router
  const {
    data: userData,
    isLoading,
    isFetching,
  } = useGetMeQuery(undefined, {
    skip: !authUser,
  });

  // ✅ 3. Add the redirect logic for unauthenticated users
  useEffect(() => {
    // Check if loading is finished and there's still no token
    if (!isFetching && !token) {
      router.push("/auth/login");
    }
  }, [token, isFetching, router]);

  if (isLoading || isFetching || !authUser) {
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

  const canCreateEvents =
    userData?.data.user &&
    (userData.data.user.isVerifiedCreator ||
      userData.data.user.systemRole === SystemRole.ADMIN ||
      userData.data.user.systemRole === SystemRole.SUPER_ADMIN);

  if (!canCreateEvents) {
    return (
      <div className="flex items-center justify-center pt-10">
        <Alert variant="destructive" className="max-w-md text-center">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be a verified creator or an administrator to post a new
            event.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
