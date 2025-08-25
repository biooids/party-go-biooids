// src/app/(app)/admin/users/page.tsx

"use client";

import { useGetAllUsersQuery } from "@/lib/features/admin/adminApiSlice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import UserDataTable from "@/components/pages/admin/users/UserDataTable";

export default function AdminUsersPage() {
  const { data, isLoading, isError } = useGetAllUsersQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        {/* Skeleton loader for the data table */}
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
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
          Failed to load user data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      <p className="text-muted-foreground">
        View, ban, and manage roles for all users on the platform.
      </p>
      <UserDataTable users={data?.data.users || []} />
    </div>
  );
}
