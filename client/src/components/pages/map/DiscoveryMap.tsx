"use client";

import { useState, useEffect } from "react";
import Map from "./Map";
import { Marker, Popup, ViewStateChangeEvent } from "react-map-gl";
import { useGetPlacesNearbyQuery } from "@/lib/features/map/mapApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce"; // ✅ 1. Import useDebounce
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
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

const DEFAULT_LOCATION = { longitude: 30.0588, latitude: -1.9441 };

export default function DiscoveryMap() {
  const [viewState, setViewState] = useState({ ...DEFAULT_LOCATION, zoom: 12 });
  const [selectedCategory, setSelectedCategory] = useState("bar,nightclub");
  const [popupInfo, setPopupInfo] = useState<MapPlaceFeature | null>(null);

  // ✅ 2. Debounce the viewState to prevent excessive API calls
  const debouncedViewState = useDebounce(viewState, 500); // 500ms delay

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

  // ✅ 3. Use the DEBOUNCED coordinates for the API query
  const { data: placesData, isLoading } = useGetPlacesNearbyQuery({
    lng: debouncedViewState.longitude,
    lat: debouncedViewState.latitude,
    categories: selectedCategory,
  });

  const places = placesData?.data.features || [];

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
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
          // ✅ 4. The onMove now only updates the visual state of the map instantly.
          // The API call will wait for the debounced state to update.
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              longitude={place.geometry.coordinates[0]}
              latitude={place.geometry.coordinates[1]}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(place);
              }}
            >
              <MapPin className="h-6 w-6 text-primary cursor-pointer" />
            </Marker>
          ))}

          {popupInfo && (
            <Popup
              longitude={popupInfo.geometry.coordinates[0]}
              latitude={popupInfo.geometry.coordinates[1]}
              onClose={() => setPopupInfo(null)}
              closeOnClick={false}
              anchor="bottom"
            >
              <div className="p-1">
                <h3 className="font-bold">{popupInfo.properties.name}</h3>
                <p className="text-xs">{popupInfo.place_name}</p>
              </div>
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
}
