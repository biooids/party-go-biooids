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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // ✅ 1. Import Avatar components
import { MapPin, ImageIcon, Bookmark, BookmarkCheck } from "lucide-react";
import { format } from "date-fns";

// ✅ 2. Add the getInitials helper function
const getInitials = (name?: string) => {
  if (!name) return "?";
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function EventCard({ event }: { event: Event }) {
  const { user } = useAuth();
  const [saveEvent] = useSaveEventMutation();
  const [unsaveEvent] = useUnsaveEventMutation();

  const primaryImageUrl = event.imageUrls?.[0];

  const handleSaveToggle = (e: React.MouseEvent) => {
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
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <Link
        href={`/events/${event._id}`}
        className="group flex flex-col flex-1"
      >
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
            {user && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8 rounded-full z-10"
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
        <CardContent className="p-4 flex-1">
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
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {/* ✅ 3. ADDED: Author avatar and name, linking to their profile */}
        <Link
          href={`/profile/${event.creatorId.username}`}
          className="flex items-center gap-2 group/author"
          onClick={(e) => e.stopPropagation()} // Prevents navigating to the event page
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.creatorId.profileImage ?? ""} />
            <AvatarFallback>{getInitials(event.creatorId.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground group-hover/author:underline">
            {event.creatorId.name}
          </span>
        </Link>
        <Badge variant="secondary">{event.categoryId.name}</Badge>
      </CardFooter>
    </Card>
  );
}
