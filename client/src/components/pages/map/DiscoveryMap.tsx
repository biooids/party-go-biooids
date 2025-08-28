//src/components/pages/map/DiscoveryMap.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Map from "./Map";
import { Marker, Popup, ViewStateChangeEvent } from "react-map-gl";
import { useGetPlacesNearbyQuery } from "@/lib/features/map/mapApiSlice";
import { useGetNearbyEventsQuery } from "@/lib/features/event/eventApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPlaceFeature } from "@/lib/features/map/mapTypes";
import { Event } from "@/lib/features/event/eventTypes";
import { format } from "date-fns";

const DEFAULT_LOCATION = { longitude: 30.0588, latitude: -1.9441 }; // Kigali

// Type guard to check if an object is an Event
function isEvent(item: any): item is Event {
  return (
    item && typeof item === "object" && "_id" in item && "creatorId" in item
  );
}

export default function DiscoveryMap() {
  const [viewState, setViewState] = useState({ ...DEFAULT_LOCATION, zoom: 12 });
  const [selectedCategory, setSelectedCategory] = useState("bar,nightclub");
  const [popupInfo, setPopupInfo] = useState<MapPlaceFeature | Event | null>(
    null
  );

  const debouncedViewState = useDebounce(viewState, 500);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewState((prev) => ({
          ...prev,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        }));
      });
    }
  }, []);

  // Fetch general places from Mapbox
  const { data: placesData, isLoading: isLoadingPlaces } =
    useGetPlacesNearbyQuery({
      lng: debouncedViewState.longitude,
      lat: debouncedViewState.latitude,
      categories: selectedCategory,
    });

  // Fetch your app's events
  const { data: eventsData, isLoading: isLoadingEvents } =
    useGetNearbyEventsQuery({
      lng: debouncedViewState.longitude,
      lat: debouncedViewState.latitude,
    });

  const places = placesData?.data.features || [];
  const events = eventsData?.data.events || [];
  const isLoading = isLoadingPlaces || isLoadingEvents;

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-4 z-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Places</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select categories..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar,nightclub">Bars & Clubs</SelectItem>
                <SelectItem value="restaurant,cafe">Food & Drink</SelectItem>
                <SelectItem value="park,tourist_attraction">
                  Attractions
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <Map
          viewState={viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          {/* Render Markers for Mapbox Places */}
          {places.map((place) => (
            <Marker
              key={`place-${place.id}`}
              longitude={place.geometry.coordinates[0]}
              latitude={place.geometry.coordinates[1]}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(place);
              }}
            >
              <MapPin className="h-6 w-6 text-primary cursor-pointer drop-shadow-md" />
            </Marker>
          ))}

          {/* Render Markers for Your App's Events */}
          {events.map((event) => (
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
          ))}

          {/* Render Popup for selected Place or Event */}
          {popupInfo && (
            <Popup
              longitude={
                isEvent(popupInfo)
                  ? popupInfo.location.coordinates[0]
                  : popupInfo.geometry.coordinates[0]
              }
              latitude={
                isEvent(popupInfo)
                  ? popupInfo.location.coordinates[1]
                  : popupInfo.geometry.coordinates[1]
              }
              onClose={() => setPopupInfo(null)}
              closeOnClick={false}
              anchor="bottom"
              offset={25}
            >
              {isEvent(popupInfo) ? (
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
              ) : (
                <div className="p-1 max-w-xs">
                  <h3 className="font-bold">{popupInfo.properties.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {popupInfo.place_name}
                  </p>
                </div>
              )}
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
}
