// src/app/(app)/admin/verification/page.tsx

"use client";

import { useGetPendingVerificationRequestsQuery } from "@/lib/features/admin/adminApiSlice";
import VerificationRequestList from "@/components/pages/admin/verification/VerificationRequestList";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdminVerificationPage() {
  const { data, isLoading, isError } = useGetPendingVerificationRequestsQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Verification Requests
        </h1>
        {/* Skeleton loader for the list */}
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
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
          Failed to load verification requests. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Verification Requests
      </h1>
      <p className="text-muted-foreground">
        Review the applications below to grant or deny creator permissions.
      </p>
      <VerificationRequestList requests={data?.data.requests || []} />
    </div>
  );
}
