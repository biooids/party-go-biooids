// src/components/pages/my-events/EditEventDialog.tsx

"use client";

import { useGetEventByIdQuery } from "@/lib/features/event/eventApiSlice";
import EditEventForm from "./EditEventForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EditEventDialogProps {
  eventId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEventDialog({
  eventId,
  isOpen,
  onOpenChange,
}: EditEventDialogProps) {
  // Fetch the specific event data when the dialog is opened
  const { data, isLoading, isError, isSuccess } = useGetEventByIdQuery(
    eventId,
    {
      skip: !isOpen, // Only fetch when the dialog is open
    }
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Your Event</DialogTitle>
          <DialogDescription>
            Make changes to your event details below. Editing an approved event
            will set its status back to "Pending" for re-approval.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not load event data. Please close and try again.
            </AlertDescription>
          </Alert>
        )}

        {isSuccess && data?.data.event && (
          <EditEventForm
            event={data.data.event}
            onFinished={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
