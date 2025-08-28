//src/components/pages/my-events/MyEventDetailView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Event, EventStatus } from "@/lib/features/event/eventTypes";
import { useResubmitEventMutation } from "@/lib/features/event/eventApiSlice";
import { toast } from "sonner";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons and Utils
import { Calendar, MapPin, Edit, Ticket, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Child Components
import EditEventDialog from "./EditEventDialog";
import Map from "@/components/pages/map/Map";
import { Marker, ViewStateChangeEvent } from "react-map-gl";
import EventComments from "@/components/pages/events/comments/EventComments";
import EventQRCode from "./EventQRCode";

const getStatusInfo = (status: EventStatus) => {
  switch (status) {
    case EventStatus.APPROVED:
      return { text: "Approved", className: "bg-green-500 text-white" };
    case EventStatus.PENDING:
      return { text: "Pending Review", className: "bg-yellow-500 text-white" };
    case EventStatus.REJECTED:
      return { text: "Rejected", className: "bg-red-500 text-white" };
    default:
      return { text: "Unknown", className: "bg-gray-500 text-white" };
  }
};

export default function MyEventDetailView({ event }: { event: Event }) {
  const [selectedImage, setSelectedImage] = useState(event.imageUrls?.[0]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [resubmitEvent, { isLoading: isResubmitting }] =
    useResubmitEventMutation();
  const statusInfo = getStatusInfo(event.status);

  const [viewState, setViewState] = useState({
    longitude: event.location.coordinates[0],
    latitude: event.location.coordinates[1],
    zoom: 14,
  });

  const handleResubmit = () => {
    toast.promise(resubmitEvent(event._id).unwrap(), {
      loading: "Resubmitting for approval...",
      success: "Event has been resubmitted and is now pending approval.",
      error: (err) => err.data?.message || "Failed to resubmit event.",
    });
  };

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Status Banner */}
        <div className={cn("p-4 rounded-lg text-center", statusInfo.className)}>
          <h2 className="font-bold text-lg">Status: {statusInfo.text}</h2>
        </div>

        {/* Image Gallery */}
        <div className="space-y-2">
          <div className="relative h-48 sm:h-64 md:h-96 w-full overflow-hidden rounded-lg bg-muted">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={event.name}
                fill
                priority
                className="object-cover"
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
                      ? "opacity-100 ring-2 ring-primary"
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
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                {event.name}
              </h1>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
              {event.status === EventStatus.REJECTED && (
                <Button onClick={handleResubmit} disabled={isResubmitting}>
                  {isResubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Resubmit for Approval
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {/* ✅ ADDED: Interactive map display */}
            <div className="h-48 w-full rounded-lg overflow-hidden border">
              <Map
                viewState={viewState}
                onMove={(evt: ViewStateChangeEvent) =>
                  setViewState(evt.viewState)
                }
              >
                <Marker
                  longitude={event.location.coordinates[0]}
                  latitude={event.location.coordinates[1]}
                >
                  <MapPin className="h-6 w-6 text-red-500" />
                </Marker>
              </Map>
            </div>
            {/* ✅ ADDED: Full information card */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Date and time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(event.date),
                        "EEEE, MMMM d, yyyy 'at' h:mm a"
                      )}
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

        {event.status === EventStatus.APPROVED && (
          <>
            <Separator />
            <div className="space-y-4">
              <EventQRCode
                eventId={event._id}
                qrCodeSecret={event.qrCodeSecret}
              />
            </div>
          </>
        )}

        {/* ✅ ADDED: Comments section */}
        <Separator />
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Comments{" "}
            {typeof event.commentCount === "number" &&
              `(${event.commentCount})`}
          </h2>
          <EventComments eventId={event._id} />
        </div>
      </div>
      <EditEventDialog
        eventId={event._id}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
