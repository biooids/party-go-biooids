"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event, EventStatus } from "@/lib/features/event/eventTypes";
import {
  useDeleteEventMutation,
  useResubmitEventMutation,
} from "@/lib/features/event/eventApiSlice";
import { toast } from "sonner";

// UI Components
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Icons and Utils
import { Edit, Trash2, ImageIcon, Send, Eye, Loader2 } from "lucide-react";
// ✅ 1. REMOVED: The EditEventDialog import is no longer needed.

const getInitials = (name?: string) => {
  if (!name) return "?";
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function MyEventCard({ event }: { event: Event }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  // ✅ 2. REMOVED: The state for the edit dialog is no longer needed.
  // const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteEvent] = useDeleteEventMutation();
  const [resubmitEvent, { isLoading: isResubmitting }] =
    useResubmitEventMutation();

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
      <Card className="flex flex-col">
        <div className="flex flex-col sm:flex-row flex-1">
          <Link
            href={`/my-events/${event._id}`}
            className="flex flex-col sm:flex-row flex-1 group"
          >
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
                  <CardTitle className="text-lg group-hover:underline">
                    {event.name}
                  </CardTitle>
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
              <div className="flex items-center gap-2 pt-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={event.creatorId.profileImage ?? ""} />
                  <AvatarFallback>
                    {getInitials(event.creatorId.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  Created by {event.creatorId.name}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <CardFooter className="bg-muted/50 p-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/my-events/${event._id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>

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

          {/* ✅ 3. FIXED: The "Edit" button is now a Link that navigates to the dedicated edit page. */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/my-events/${event._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
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

      {/* ✅ 4. REMOVED: The EditEventDialog component is no longer rendered here. */}

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
