//src/components/pages/map/PlaceSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useLazySearchPlacesQuery } from "@/lib/features/map/mapApiSlice";
import { MapSuggestion } from "@/lib/features/map/mapTypes";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface PlaceSearchProps {
  // A callback function to pass the selected place back to the parent component.
  onSelectPlace: (place: MapSuggestion) => void;
}

export default function PlaceSearch({ onSelectPlace }: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [triggerSearch, { data: searchData, isFetching }] =
    useLazySearchPlacesQuery();

  const suggestions = searchData?.data.suggestions || [];

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      triggerSearch({ query: debouncedQuery });
    }
  }, [debouncedQuery, triggerSearch]);

  const handleSelect = (place: MapSuggestion) => {
    setQuery(place.name); // Update the input to show the selected place
    onSelectPlace(place); // Pass the full place object to the parent
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for clubs, hotels, restaurants..."
          className="pl-10 h-12 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {debouncedQuery.length > 2 && suggestions.length > 0 && (
        <div className="absolute z-20 top-full mt-2 w-full bg-card border rounded-lg shadow-xl text-left max-h-72 overflow-y-auto">
          {suggestions.map((place) => (
            <div
              key={place.mapbox_id}
              className="p-3 hover:bg-muted cursor-pointer"
              onMouseDown={() => handleSelect(place)}
            >
              <p className="font-semibold text-sm">{place.name}</p>
              <p className="text-xs text-muted-foreground">
                {place.place_formatted}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
