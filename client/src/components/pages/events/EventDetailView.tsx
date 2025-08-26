// src/components/pages/events/EventDetailView.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event } from "@/lib/features/event/eventTypes";
import {
  useSaveEventMutation,
  useUnsaveEventMutation,
} from "@/lib/features/savedEvent/savedEventApiSlice";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Ticket,
  Share2,
  Bookmark,
  BookmarkCheck,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function EventDetailView({ event }: { event: Event }) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(event.imageUrls?.[0]);
  const [isCopied, setIsCopied] = useState(false);

  const [saveEvent, { isLoading: isSaving }] = useSaveEventMutation();
  const [unsaveEvent, { isLoading: isUnsaving }] = useUnsaveEventMutation();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToggle = () => {
    if (!user) {
      toast.error("You must be logged in to save events.");
      return;
    }

    const action = event.isSaved
      ? unsaveEvent(event._id)
      : saveEvent(event._id);

    toast.promise(action.unwrap(), {
      loading: event.isSaved ? "Unsaving event..." : "Saving event...",
      success: event.isSaved ? "Event unsaved!" : "Event saved!",
      error: (err) => err.data?.message || "An error occurred.",
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-2">
        <div className="relative h-48 sm:h-64 md:h-96 w-full overflow-hidden rounded-lg bg-muted">
          {selectedImage && (
            <Image
              src={selectedImage}
              alt={event.name}
              fill
              priority
              className="object-cover transition-all duration-300"
              sizes="100vw"
            />
          )}
        </div>
        {event.imageUrls.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {event.imageUrls.map((url, index) => (
              <button
                key={index}
                className={cn(
                  "relative aspect-video w-full overflow-hidden rounded-md transition-opacity hover:opacity-100",
                  selectedImage === url
                    ? "opacity-100 ring-2 ring-primary ring-offset-2"
                    : "opacity-60"
                )}
                onClick={() => setSelectedImage(url)}
              >
                <Image
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>
            <p className="mt-2 text-muted-foreground">{event.description}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              {isCopied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              {isCopied ? "Copied!" : "Share"}
            </Button>
            {user && (
              <Button
                onClick={handleSaveToggle}
                disabled={isSaving || isUnsaving}
              >
                {event.isSaved ? (
                  <BookmarkCheck className="mr-2 h-4 w-4" />
                ) : (
                  <Bookmark className="mr-2 h-4 w-4" />
                )}
                {event.isSaved ? "Saved" : "Save Event"}
              </Button>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Created by</h3>
            <Link
              href={`/profile/${event.creatorId.username}`}
              className="mt-2 flex items-center gap-3 group"
            >
              <Avatar>
                <AvatarImage src={event.creatorId.profileImage ?? ""} />
                <AvatarFallback>
                  {getInitials(event.creatorId.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium group-hover:underline">
                  {event.creatorId.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{event.creatorId.username}
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Date and time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                    <br />
                    {format(new Date(event.date), "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {event.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Price</p>
                  <p className="text-sm text-muted-foreground">
                    {event.price > 0 ? `$${event.price.toFixed(2)}` : "Free"}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Badge variant="secondary">{event.categoryId.name}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
