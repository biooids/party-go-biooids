// src/components/pages/events/EventCard.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { Event } from "@/lib/features/event/eventTypes";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  useSaveEventMutation,
  useUnsaveEventMutation,
} from "@/lib/features/savedEvent/savedEventApiSlice";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ImageIcon, Bookmark, BookmarkCheck } from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event }: { event: Event }) {
  const { user } = useAuth();
  const [saveEvent] = useSaveEventMutation();
  const [unsaveEvent] = useUnsaveEventMutation();

  const primaryImageUrl = event.imageUrls?.[0];

  const handleSaveToggle = (e: React.MouseEvent) => {
    // Prevent the click from navigating the user
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("You must be logged in to save events.");
      return;
    }

    const action = event.isSaved
      ? unsaveEvent(event._id)
      : saveEvent(event._id);

    toast.promise(action.unwrap(), {
      loading: event.isSaved ? "Unsaving..." : "Saving...",
      success: event.isSaved ? "Event unsaved!" : "Event saved!",
      error: (err) => err.data?.message || "An error occurred.",
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <Link href={`/events/${event._id}`} className="group">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-muted">
            {primaryImageUrl ? (
              <Image
                src={primaryImageUrl}
                alt={event.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            {/* Save/Unsave Icon Button */}
            {user && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8 rounded-full"
                onClick={handleSaveToggle}
              >
                {event.isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {event.isSaved ? "Unsave event" : "Save event"}
                </span>
              </Button>
            )}
            <div className="absolute top-2 right-2">
              <Badge>
                {event.price > 0 ? `$${event.price.toFixed(2)}` : "Free"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-primary font-semibold">
            {format(new Date(event.date), "EEE, MMM d 'at' h:mm a")}
          </p>
          <CardTitle className="mt-1 text-lg group-hover:underline">
            {event.name}
          </CardTitle>
          <p className="mt-2 flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1.5 h-4 w-4 shrink-0" />
            {event.address}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Badge variant="secondary">{event.categoryId.name}</Badge>
      </CardFooter>
    </Card>
  );
}
