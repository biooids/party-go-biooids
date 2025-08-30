// src/app/(app)/events/page.tsx

"use client";

import { useState } from "react";
import EventList from "@/components/pages/events/EventList";
import DiscoveryMap from "@/components/pages/map/DiscoveryMap";
import PlaceSearch from "@/components/pages/map/PlaceSearch";
import { MapSuggestion } from "@/lib/features/map/mapTypes";
import { useLazyRetrievePlaceQuery } from "@/lib/features/map/mapApiSlice";
import { Map, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function EventsPage() {
  // ✅ 1. Update state to store the full place details, not just coordinates.
  const [selectedPlace, setSelectedPlace] = useState<MapSuggestion | null>(
    null
  );

  const [retrievePlace] = useLazyRetrievePlaceQuery();

  const handlePlaceSelect = async (place: MapSuggestion) => {
    toast.info(`Finding "${place.name}"...`);
    try {
      const result = await retrievePlace(place.mapbox_id).unwrap();
      const feature = result.data.details.features[0];

      // ✅ 2. Store the full feature object, which includes name and coordinates.
      // We'll create a simple object that matches the MapSuggestion structure.
      if (feature && feature.geometry?.coordinates) {
        const [longitude, latitude] = feature.geometry.coordinates;
        setSelectedPlace({
          name: feature.properties.name,
          mapbox_id: feature.properties.mapbox_id,
          place_formatted: feature.properties.place_formatted,
          // Add other needed properties from the feature
          // For the map, we mainly need the coordinates which are in the feature geometry
          context: { geo: { longitude, latitude } },
        } as MapSuggestion);
      } else {
        throw new Error("Coordinates not found in response.");
      }
    } catch (error) {
      toast.error("Could not get details for this location.");
      console.error("Failed to retrieve place details:", error);
    }
  };

  // Create a viewState object from the selected place for the map
  const initialMapViewState = selectedPlace?.context?.geo
    ? { ...selectedPlace.context.geo, zoom: 15 }
    : undefined;

  return (
    <div className="flex flex-col h-full -m-6">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 pb-4 border-b gap-4">
        <div className="space-y-1 w-full">
          {/* ✅ 3. Make the title dynamic */}
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedPlace
              ? `Events Near ${selectedPlace.name}`
              : "Explore Events"}
          </h1>
          <p className="text-muted-foreground">
            Find events near you or search for a specific place.
          </p>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[300px] lg:min-w-[400px]">
          <PlaceSearch onSelectPlace={handlePlaceSelect} />
        </div>
      </div>

      <Tabs defaultValue="map" className="flex flex-col flex-1">
        <TabsList className="w-full rounded-none justify-center border-b">
          <TabsTrigger value="map">
            <Map className="mr-2 h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="mr-2 h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="flex-1">
          {/* ✅ 4. Pass the full selectedPlace object to the map */}
          <DiscoveryMap
            key={JSON.stringify(selectedPlace)}
            initialViewState={initialMapViewState}
            selectedPlace={selectedPlace}
          />
        </TabsContent>
        <TabsContent value="list" className="flex-1">
          <EventList location={initialMapViewState} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
