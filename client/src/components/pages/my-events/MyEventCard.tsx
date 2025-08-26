//src/components/pages/my-events/MyEventCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event, EventStatus } from "@/lib/features/event/eventTypes";
import {
  useDeleteEventMutation,
  useResubmitEventMutation, // ✅ 1. Import the new resubmit hook
} from "@/lib/features/event/eventApiSlice";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ImageIcon, Send, Eye, Loader2 } from "lucide-react"; // ✅ 2. Import new icons
import EditEventDialog from "./EditEventDialog";

export default function MyEventCard({ event }: { event: Event }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteEvent] = useDeleteEventMutation();
  const [resubmitEvent, { isLoading: isResubmitting }] =
    useResubmitEventMutation(); // ✅ 3. Initialize the new mutation hook

  const getStatusVariant = (status: EventStatus) => {
    switch (status) {
      case EventStatus.APPROVED:
        return "default";
      case EventStatus.PENDING:
        return "secondary";
      case EventStatus.REJECTED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleDelete = () => {
    toast.promise(deleteEvent(event._id).unwrap(), {
      loading: "Deleting event...",
      success: "Event deleted successfully.",
      error: (err) => err.data?.message || "Failed to delete event.",
    });
    setIsAlertOpen(false);
  };

  // ✅ 4. Add a handler for the new resubmit action
  const handleResubmit = () => {
    toast.promise(resubmitEvent(event._id).unwrap(), {
      loading: "Resubmitting for approval...",
      success: "Event has been resubmitted for approval.",
      error: (err) => err.data?.message || "Failed to resubmit event.",
    });
  };

  const primaryImageUrl = event.imageUrls?.[0];

  return (
    <>
      {/* ✅ 5. NEW DESIGN: A cleaner, more organized card structure. */}
      <Card>
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 bg-muted">
            {primaryImageUrl ? (
              <Image
                src={primaryImageUrl}
                alt={event.name}
                fill
                className="object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-r-none"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 p-4">
            <CardHeader className="p-0">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">{event.name}</CardTitle>
                <Badge
                  variant={getStatusVariant(event.status)}
                  className="capitalize shrink-0"
                >
                  {event.status.toLowerCase()}
                </Badge>
              </div>
              <CardDescription>{event.address}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2 flex-1">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            </CardContent>
          </div>
        </div>
        {/* ✅ 6. NEW FOOTER: Action buttons are now grouped in the footer with conditional logic. */}
        <CardFooter className="bg-muted/50 p-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/my-events/${event._id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>

          {/* If event is rejected, show a "Resubmit" button */}
          {event.status === EventStatus.REJECTED && (
            <Button
              size="sm"
              onClick={handleResubmit}
              disabled={isResubmitting}
            >
              {isResubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Resubmit
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsAlertOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </CardFooter>
      </Card>

      <EditEventDialog
        eventId={event._id}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event and all its images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
