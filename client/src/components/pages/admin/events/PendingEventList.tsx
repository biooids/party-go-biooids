// src/components/pages/admin/events/PendingEventList.tsx

"use client";

import { useState } from "react";
import { PendingEventView } from "@/lib/features/admin/adminTypes";
import {
  useApproveEventMutation,
  useRejectEventMutation,
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
import { Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface PendingEventListProps {
  events: PendingEventView[];
}

const EventCard = ({ event }: { event: PendingEventView }) => {
  const [approveEvent, { isLoading: isApproving }] = useApproveEventMutation();
  const [rejectEvent, { isLoading: isRejecting }] = useRejectEventMutation();
  const [actionTaken, setActionTaken] = useState(false);

  const handleApprove = async () => {
    toast.promise(approveEvent(event._id).unwrap(), {
      loading: "Approving event...",
      success: "Event approved successfully!",
      error: "Failed to approve event.",
    });
    setActionTaken(true);
  };

  const handleReject = async () => {
    toast.promise(rejectEvent(event._id).unwrap(), {
      loading: "Rejecting event...",
      success: "Event rejected successfully!",
      error: "Failed to reject event.",
    });
    setActionTaken(true);
  };

  if (actionTaken) {
    return null; // Hide the card after an action is taken
  }

  const isLoading = isApproving || isRejecting;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>
              Created by @{event.creatorId.username}
            </CardDescription>
          </div>
          <Badge variant="outline">{event.categoryId.name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{event.description}</p>
        <p className="text-sm text-muted-foreground">
          <strong>Date:</strong>{" "}
          {format(new Date(event.date), "EEE, MMM d, yyyy 'at' h:mm a")}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Location:</strong> {event.address}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Price:</strong> ${event.price.toFixed(2)}
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

export default function PendingEventList({ events }: PendingEventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-card">
        <Check className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold">All Caught Up!</h3>
        <p className="text-muted-foreground">
          There are no events pending approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
