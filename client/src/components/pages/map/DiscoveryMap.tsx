"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useGetNearbyEventsQuery } from "@/lib/features/event/eventApiSlice";
import { useGetAllCategoriesQuery } from "@/lib/features/eventCategory/eventCategoryApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Event } from "@/lib/features/event/eventTypes";
import { MapSuggestion } from "@/lib/features/map/mapTypes";
import { format } from "date-fns";
import { toast } from "sonner";
import Map from "./Map";
import { Marker, Popup, ViewStateChangeEvent } from "react-map-gl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PartyPopper,
  LocateFixed,
  Loader2,
  Filter,
  Building2, // ✅ 1. Import a new icon for places
} from "lucide-react";

const DEFAULT_LOCATION = { longitude: 0, latitude: 20, zoom: 1.5 };

interface DiscoveryMapProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  selectedPlace?: MapSuggestion | null; // ✅ 2. Add prop to receive the selected place
}

export default function DiscoveryMap({
  initialViewState,
  selectedPlace,
}: DiscoveryMapProps) {
  const [viewState, setViewState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
  } | null>(initialViewState || null);
  const [popupInfo, setPopupInfo] = useState<Event | null>(null);
  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [radius, setRadius] = useState("10000");
  const [categoryId, setCategoryId] = useState("all");

  const debouncedViewState = useDebounce(viewState, 500);
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const { data: eventsData, isLoading: isLoadingEvents } =
    useGetNearbyEventsQuery(
      {
        lng: debouncedViewState?.longitude ?? 0,
        lat: debouncedViewState?.latitude ?? 0,
        radius: parseInt(radius, 10),
        categoryId: categoryId,
      },
      { skip: !debouncedViewState }
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
          setIsLoadingLocation(false);
          toast.success("Location found!");
        },
        () => {
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

  useEffect(() => {
    if (initialViewState) {
      setIsLoadingLocation(false);
    } else {
      handleFindMe(12);
    }
  }, [initialViewState]);

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
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background p-2 rounded-lg shadow-md">
        <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[150px] sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoriesData?.data.categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={radius} onValueChange={setRadius}>
          <SelectTrigger className="w-[100px] sm:w-[120px]">
            <SelectValue placeholder="Radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000">1 km</SelectItem>
            <SelectItem value="5000">5 km</SelectItem>
            <SelectItem value="10000">10 km</SelectItem>
            <SelectItem value="25000">25 km</SelectItem>
            <SelectItem value="50000000">Unlimited</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {viewState && (
        <Map
          viewState={viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          {/* User's Location Marker */}
          {userLocation && (
            <Marker
              longitude={userLocation.longitude}
              latitude={userLocation.latitude}
            >
              <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
            </Marker>
          )}

          {/* ✅ STEP 3: Add a new marker for the specifically searched place */}
          {selectedPlace && selectedPlace.context?.geo && (
            <Marker
              longitude={selectedPlace.context.geo.longitude}
              latitude={selectedPlace.context.geo.latitude}
              offset={[0, -15]}
            >
              <div className="flex flex-col items-center">
                <div className="bg-background text-foreground text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                  {selectedPlace.name}
                </div>
                <Building2 className="h-7 w-7 text-blue-500 drop-shadow-lg" />
              </div>
            </Marker>
          )}

          {/* Event Markers */}
          {isLoadingEvents && !events.length ? (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : (
            events.map((eventItem) => (
              <Marker
                key={`event-${eventItem._id}`}
                longitude={eventItem.location.coordinates[0]}
                latitude={eventItem.location.coordinates[1]}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo(eventItem);
                }}
              >
                <PartyPopper className="h-7 w-7 text-purple-500 cursor-pointer drop-shadow-md" />
              </Marker>
            ))
          )}

          {/* Event Popup */}
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
                <p className="text-xs text-primary font-semibold">
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
