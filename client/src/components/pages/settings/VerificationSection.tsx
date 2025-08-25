// src/components/pages/settings/VerificationSection.tsx

"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/features/user/userTypes";
import RequestVerificationDialog from "./RequestVerificationDialog";
import { useGetMyVerificationRequestQuery } from "@/lib/features/verificationRequest/verificationRequestApiSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Hourglass, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationStatus } from "@/lib/features/verificationRequest/verificationRequestTypes";

export default function VerificationSection({ user }: { user: UserProfile }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ Use the new hook to fetch the user's request status
  const { data: requestData, isLoading } = useGetMyVerificationRequestQuery();
  const requestStatus = requestData?.data.request?.status;

  if (isLoading) {
    return <Skeleton className="h-28 w-full" />;
  }

  // Case 1: The user is already a verified creator.
  if (user.isVerifiedCreator) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>You are a Verified Creator</CardTitle>
          </div>
          <CardDescription>
            You have been approved to create and publish events on the platform.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Case 2: The user has a request that is pending.
  if (requestStatus === VerificationStatus.PENDING) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Hourglass className="h-5 w-5 text-yellow-500" />
            <CardTitle>Request Pending Review</CardTitle>
          </div>
          <CardDescription>
            Your application is currently under review by our moderation team.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Case 3: The user's request was rejected.
  if (requestStatus === VerificationStatus.REJECTED) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Request Not Approved</CardTitle>
          </div>
          <CardDescription>
            Unfortunately, your previous application was not approved. Please
            contact support if you believe this is an error.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Default Case: The user has not applied yet.
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Become a Creator</CardTitle>
          <CardDescription>
            Apply to get verified and start posting your own events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsDialogOpen(true)}>
            Start Verification
          </Button>
        </CardContent>
      </Card>
      <RequestVerificationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
