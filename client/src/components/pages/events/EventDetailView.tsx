// src/components/pages/events/EventDetailView.tsx

"use client";

import { useState } from "react"; // ✅ 1. Import useState to manage the selected image
import Image from "next/image";
import Link from "next/link";
import { Event } from "@/lib/features/event/eventTypes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const getInitials = (name: string) => {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function EventDetailView({ event }: { event: Event }) {
  // ✅ 2. Keep track of the currently selected image for the main view
  const [selectedImage, setSelectedImage] = useState(event.imageUrls?.[0]);

  return (
    <div className="mx-auto max-w-4xl">
      {/* ✅ 3. Image Gallery Section */}
      <div className="space-y-2">
        {/* Main Image */}
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
        {/* Thumbnails */}
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

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>
          <div>
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="mt-2 text-muted-foreground">{event.description}</p>
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

        {/* Right Column: Info & Actions */}
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
              <div className="pt-2">
                <Badge variant="secondary">{event.categoryId.name}</Badge>
              </div>
            </CardContent>
          </Card>
          <Button size="lg" className="w-full">
            <Ticket className="mr-2 h-5 w-5" />
            {event.price > 0
              ? `Buy Tickets - $${event.price.toFixed(2)}`
              : "Register for Free"}
          </Button>
        </div>
      </div>
    </div>
  );
}
