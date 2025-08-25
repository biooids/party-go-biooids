// src/components/pages/events/EventCard.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { Event } from "@/lib/features/event/eventTypes";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ImageIcon } from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event }: { event: Event }) {
  // ✅ 1. Get the first image from the array to use as the thumbnail.
  const primaryImageUrl = event.imageUrls?.[0];

  return (
    <Link href={`/events/${event._id}`} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-muted">
            {/* ✅ 2. Display the primary image, or a placeholder if none exists. */}
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
            <div className="absolute top-2 right-2">
              <Badge>${event.price.toFixed(2)}</Badge>
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
        <CardFooter className="p-4 pt-0">
          <Badge variant="secondary">{event.categoryId.name}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
