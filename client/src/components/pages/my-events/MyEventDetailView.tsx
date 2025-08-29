//src/components/pages/my-events/MyEventDetailView.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Event, EventStatus } from "@/lib/features/event/eventTypes";
import { useResubmitEventMutation } from "@/lib/features/event/eventApiSlice";
import { cn } from "@/lib/utils";
import { useLazyGetDirectionsQuery } from "@/lib/features/directions/directionsApiSlice";
import { RouteData } from "@/lib/features/directions/directionsTypes";
import RouteLayer from "../map/RouteLayer";
import { getBoundsForRoute } from "@/lib/utils/map-utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Calendar,
  MapPin,
  Ticket,
  Edit,
  Send,
  Loader2,
  Expand,
  Route,
} from "lucide-react";

// Map & Child Components
import Map from "@/components/pages/map/Map";
import { Marker, ViewState, ViewStateChangeEvent } from "react-map-gl";
import EventComments from "@/components/pages/events/comments/EventComments";
import EventQRCode from "./EventQRCode";

// Helper function to get color and text based on event status
const getStatusInfo = (status: EventStatus) => {
  switch (status) {
    case EventStatus.APPROVED:
      return {
        text: "Approved & Live",
        className: "bg-green-100 text-green-800 border-green-300 border",
      };
    case EventStatus.PENDING:
      return {
        text: "Pending Review",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300 border",
      };
    case EventStatus.REJECTED:
      return {
        text: "Rejected",
        className: "bg-red-100 text-red-800 border-red-300 border",
      };
    case EventStatus.CANCELLED:
      return {
        text: "Cancelled",
        className: "bg-gray-100 text-gray-800 border-gray-300 border",
      };
    default:
      return { text: "Unknown", className: "bg-gray-200 text-gray-800" };
  }
};

export default function MyEventDetailView({ event }: { event: Event }) {
  const [selectedImage, setSelectedImage] = useState(event.imageUrls?.[0]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [resubmitEvent, { isLoading: isResubmitting }] =
    useResubmitEventMutation();
  const statusInfo = getStatusInfo(event.status);

  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const [viewState, setViewState] = useState<ViewState>({
    longitude: event.location.coordinates[0],
    latitude: event.location.coordinates[1],
    zoom: 14,
    pitch: 30,
    bearing: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const [getDirections, { isFetching: isRouteLoading }] =
    useLazyGetDirectionsQuery();

  const handleGetDirections = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setRouteData(null);
    toast.info("Finding your location...");
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );
      const start = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
      };
      setUserLocation({ longitude: start.lng, latitude: start.lat });
      toast.info("Calculating route...");
      const result = await getDirections({
        start,
        end: {
          lng: event.location.coordinates[0],
          lat: event.location.coordinates[1],
        },
      }).unwrap();
      setRouteData(result.data.route);
      toast.success("Route found!");
    } catch (error) {
      toast.error(
        "Could not get directions. Please ensure location access is enabled."
      );
    }
  }, [event.location.coordinates, getDirections]);

  useEffect(() => {
    if (routeData && mapContainerRef.current) {
      const { width, height } = mapContainerRef.current.getBoundingClientRect();
      const newViewState = getBoundsForRoute(routeData.geometry, width, height);
      setViewState((prevState) => ({ ...prevState, ...newViewState }));
    }
  }, [routeData]);

  const handleResubmit = () => {
    toast.promise(resubmitEvent(event._id).unwrap(), {
      loading: "Resubmitting for approval...",
      success: "Event has been resubmitted and is now pending approval.",
      error: (err) => err.data?.message || "Failed to resubmit event.",
    });
  };

  const MapContent = ({
    onMove,
  }: {
    onMove?: (evt: ViewStateChangeEvent) => void;
  }) => (
    <Map viewState={viewState} onMove={onMove}>
      <Marker
        longitude={event.location.coordinates[0]}
        latitude={event.location.coordinates[1]}
      >
        <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
      </Marker>
      {userLocation && (
        <Marker
          longitude={userLocation.longitude}
          latitude={userLocation.latitude}
        >
          <div className="h-3 w-3 bg-blue-500 rounded-full border-2 border-white shadow" />
        </Marker>
      )}
      {routeData && (
        <RouteLayer id="my-event-route" routeGeoJson={routeData.geometry} />
      )}
    </Map>
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 py-8">
        {/* --- Status Banner --- */}
        <div className={cn("p-4 rounded-lg text-center", statusInfo.className)}>
          <h2 className="font-bold text-lg">Status: {statusInfo.text}</h2>
          {event.status === EventStatus.PENDING && (
            <p className="text-sm">
              Your event is currently being reviewed by our team.
            </p>
          )}
          {event.status === EventStatus.REJECTED && (
            <p className="text-sm">
              Your event was not approved. You can edit the details and
              resubmit.
            </p>
          )}
          {event.status === EventStatus.APPROVED && (
            <p className="text-sm">
              Your event is live and visible to the public.
            </p>
          )}
        </div>

        {/* --- Image Gallery --- */}
        <div className="space-y-2">
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-lg bg-muted">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={event.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1280px"
              />
            )}
          </div>
          {event.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {event.imageUrls.map((url, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative aspect-video w-full overflow-hidden rounded-md transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
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

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {event.name}
              </h1>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href={`/my-events/${event._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleGetDirections}
                disabled={isRouteLoading}
              >
                {isRouteLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Route className="mr-2 h-4 w-4" />
                )}
                Get Directions
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
          <div className="space-y-6">
            <div
              ref={mapContainerRef}
              className="relative h-64 w-full rounded-lg overflow-hidden border"
            >
              <MapContent onMove={(evt) => setViewState(evt.viewState)} />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => setIsMapModalOpen(true)}
              >
                <Expand className="h-4 w-4" />
                <span className="sr-only">Open full map</span>
              </Button>
            </div>
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

        {/* --- QR Code Section (Creator Only) --- */}
        {event.status === EventStatus.APPROVED && (
          <>
            <Separator />
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Attendee Check-in
              </h2>
              <EventQRCode
                eventId={event._id}
                qrCodeSecret={event.qrCodeSecret}
              />
            </div>
          </>
        )}

        {/* --- Comments Section --- */}
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

      {/* --- Full-Screen Map Modal --- */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-2">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Event Location: {event.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 rounded-lg overflow-hidden">
            <MapContent onMove={(evt) => setViewState(evt.viewState)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
