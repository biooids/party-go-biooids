// src/app/(app)/admin/categories/page.tsx

"use client";

import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import CategoryManager from "@/components/pages/admin/categories/CategoryManager"; // This component will render the list and actions

export default function AdminCategoriesPage() {
  const { data, isLoading, isError } = useGetAllCategoriesQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Event Category Management
        </h1>
        {/* Skeleton loader for the list */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
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
          Failed to load event categories. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        Event Category Management
      </h1>
      <p className="text-muted-foreground">
        Create, edit, and delete the categories that users can assign to their
        events.
      </p>
      <CategoryManager categories={data?.data.categories || []} />
    </div>
  );
}
