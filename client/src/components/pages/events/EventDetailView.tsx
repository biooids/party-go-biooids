"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
// ✅ STEP 1: Import Dialog components and the Expand icon
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Ticket,
  Share2,
  Bookmark,
  BookmarkCheck,
  Check,
  Compass,
  Loader2,
  Expand,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import EventComments from "./comments/EventComments";
import Map from "@/components/pages/map/Map";
import { Marker, ViewStateChangeEvent } from "react-map-gl";
import { useLazyGetDirectionsQuery } from "@/lib/features/directions/directionsApiSlice";
import { RouteData } from "@/lib/features/directions/directionsTypes";
import RouteLayer from "../map/RouteLayer";
import { getBoundsForRoute } from "@/lib/utils/map-utils";

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
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // ✅ STEP 2: Add state to control the modal's visibility
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: event.location.coordinates[0],
    latitude: event.location.coordinates[1],
    zoom: 14,
  });
  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const [saveEvent, { isLoading: isSaving }] = useSaveEventMutation();
  const [unsaveEvent, { isLoading: isUnsaving }] = useUnsaveEventMutation();
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
      setViewState(newViewState);
    }
  }, [routeData]);

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
    <>
      <div className="mx-auto max-w-4xl space-y-8">
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
              <h1 className="text-4xl font-bold tracking-tight">
                {event.name}
              </h1>
              <p className="mt-2 text-muted-foreground">{event.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleGetDirections}
                disabled={isRouteLoading}
              >
                {isRouteLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Compass className="mr-2 h-4 w-4" />
                )}
                Get Directions
              </Button>
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
            {/* ✅ STEP 3: Add a `relative` class and the Expand button */}
            <div
              ref={mapContainerRef}
              className="relative h-48 w-full rounded-lg overflow-hidden border"
            >
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
                  <MapPin className="h-6 w-6 text-red-500 drop-shadow-md" />
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
                  <RouteLayer
                    id="event-route"
                    routeGeoJson={routeData.geometry}
                  />
                )}
              </Map>
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

      {/* ✅ STEP 4: Add the Dialog (Modal) component to the bottom of the JSX */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-2">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Event Location: {event.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 rounded-lg overflow-hidden">
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
                <MapPin className="h-6 w-6 text-red-500 drop-shadow-md" />
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
                <RouteLayer
                  id="event-route-modal"
                  routeGeoJson={routeData.geometry}
                />
              )}
            </Map>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
