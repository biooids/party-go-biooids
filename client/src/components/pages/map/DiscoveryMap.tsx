//src/components/pages/map/DiscoveryMap.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Map from "./Map";
import { Marker, Popup, ViewStateChangeEvent } from "react-map-gl";
import { useGetNearbyEventsQuery } from "@/lib/features/event/eventApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PartyPopper, LocateFixed, Loader2 } from "lucide-react";
import { Event } from "@/lib/features/event/eventTypes";
import { format } from "date-fns";
import { toast } from "sonner";

const DEFAULT_LOCATION = { longitude: 0, latitude: 20, zoom: 1.5 }; // A zoomed-out global view

function isEvent(item: any): item is Event {
  return (
    item && typeof item === "object" && "_id" in item && "creatorId" in item
  );
}

export default function DiscoveryMap() {
  // ✅ 1. Initialize viewState to null. The map won't render until this is set.
  const [viewState, setViewState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
  } | null>(null);
  const [popupInfo, setPopupInfo] = useState<Event | null>(null);
  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  // ✅ 2. Add a dedicated loading state for finding the initial location.
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const debouncedViewState = useDebounce(viewState, 500);

  // Use skip token to prevent fetching events until we have a location
  const { data: eventsData, isLoading: isLoadingEvents } =
    useGetNearbyEventsQuery(
      {
        lng: debouncedViewState?.longitude ?? 0,
        lat: debouncedViewState?.latitude ?? 0,
      },
      {
        skip: !debouncedViewState, // Don't fetch if viewState is null
      }
    );

  const events = eventsData?.data.events || [];

  const handleFindMe = (zoomLevel = 14) => {
    if ("geolocation" in navigator) {
      toast.info("Finding your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setViewState({ longitude, latitude, zoom: zoomLevel });
          setUserLocation({ longitude, latitude });
          setIsLoadingLocation(false); // ✅ Stop loading once found
          toast.success("Location found!");
        },
        () => {
          // ✅ If user denies permission or it fails, use the default.
          toast.error("Could not access your location. Showing default map.");
          setViewState(DEFAULT_LOCATION);
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported. Showing default map.");
      setViewState(DEFAULT_LOCATION);
      setIsLoadingLocation(false);
    }
  };

  // ✅ 3. On the very first load, try to find the user's location.
  useEffect(() => {
    handleFindMe(12); // Find location with a wider initial zoom
  }, []);

  // ✅ 4. Show a loading screen while finding the user's location.
  if (isLoadingLocation) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Finding your location...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handleFindMe()}
          aria-label="Find my location"
        >
          <LocateFixed className="h-5 w-5" />
        </Button>
      </div>

      {/* Render the map only after the initial location is determined */}
      {viewState && (
        <Map
          viewState={viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          {userLocation && (
            <Marker
              longitude={userLocation.longitude}
              latitude={userLocation.latitude}
            >
              <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
            </Marker>
          )}

          {isLoadingEvents && !events.length ? (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : (
            events.map((event) => (
              <Marker
                key={`event-${event._id}`}
                longitude={event.location.coordinates[0]}
                latitude={event.location.coordinates[1]}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo(event);
                }}
              >
                <PartyPopper className="h-7 w-7 text-purple-500 cursor-pointer drop-shadow-md" />
              </Marker>
            ))
          )}

          {popupInfo && (
            <Popup
              longitude={popupInfo.location.coordinates[0]}
              latitude={popupInfo.location.coordinates[1]}
              onClose={() => setPopupInfo(null)}
              closeOnClick={false}
              anchor="bottom"
              offset={25}
            >
              <div className="p-1 max-w-xs">
                <p className="text-xs text-purple-600 font-semibold">
                  {format(new Date(popupInfo.date), "MMM d, h:mm a")}
                </p>
                <h3 className="font-bold text-base">{popupInfo.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {popupInfo.address}
                </p>
                <Button asChild size="sm" className="mt-2 w-full">
                  <Link href={`/events/${popupInfo._id}`}>View Event</Link>
                </Button>
              </div>
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
}
