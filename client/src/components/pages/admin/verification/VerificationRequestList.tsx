// src/components/pages/admin/verification/VerificationRequestList.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { VerificationRequest } from "@/lib/features/verificationRequest/verificationRequestTypes";
import {
  useApproveVerificationRequestMutation,
  useRejectVerificationRequestMutation,
} from "@/lib/features/admin/adminApiSlice";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Hourglass } from "lucide-react";

interface VerificationRequestListProps {
  requests: VerificationRequest[];
}

const RequestCard = ({ request }: { request: VerificationRequest }) => {
  const [approveRequest, { isLoading: isApproving }] =
    useApproveVerificationRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] =
    useRejectVerificationRequestMutation();
  const [actionTaken, setActionTaken] = useState(false);

  const handleApprove = () => {
    toast.promise(approveRequest(request._id).unwrap(), {
      loading: "Approving request...",
      success: `Request from @${request.userId.username} approved!`,
      error: "Failed to approve request.",
    });
    setActionTaken(true);
  };

  const handleReject = () => {
    toast.promise(rejectRequest(request._id).unwrap(), {
      loading: "Rejecting request...",
      success: `Request from @${request.userId.username} rejected.`,
      error: "Failed to reject request.",
    });
    setActionTaken(true);
  };

  if (actionTaken) {
    return null; // Hide the card after an action is taken to clear the queue
  }

  const isLoading = isApproving || isRejecting;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              <Link
                href={`/profile/${request.userId.username}`}
                className="hover:underline"
              >
                {request.userId.name} (@{request.userId.username})
              </Link>
            </CardTitle>
            <CardDescription>Location: {request.location}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {request.preferredCategories.map((category) => (
              <Badge key={category._id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm italic p-4 bg-muted rounded-md">
          "{request.reason}"
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={isLoading}
        >
          {isRejecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-2 h-4 w-4" />
          )}
          Reject
        </Button>
        <Button size="sm" onClick={handleApprove} disabled={isLoading}>
          {isApproving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function VerificationRequestList({
  requests,
}: VerificationRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
        <Hourglass className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Queue is Empty</h3>
        <p className="text-muted-foreground">
          There are no new verification requests to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard key={request._id} request={request} />
      ))}
    </div>
  );
}
