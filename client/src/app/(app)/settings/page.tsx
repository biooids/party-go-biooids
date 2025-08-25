"use client";

import VerificationSection from "@/components/pages/settings/VerificationSection";
import { useGetMeQuery } from "@/lib/features/user/userApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AccountSettingsPage() {
  const { data: userData, isLoading, isError } = useGetMeQuery();

  // The route protection is now handled by the layout.tsx

  return (
    <div className="space-y-8">
      {isLoading && <Skeleton className="h-24 w-full" />}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Could not load user data.</AlertDescription>
        </Alert>
      )}

      {userData && <VerificationSection user={userData.data.user} />}
    </div>
  );
}
