//src/components/pages/map/RouteLayer.tsx
"use client";

import { Source, Layer } from "react-map-gl";
import type { LineString } from "geojson";

interface RouteLayerProps {
  // A unique ID for this route layer to prevent conflicts
  id: string;
  // The GeoJSON data for the route line
  routeGeoJson: LineString;
}

export default function RouteLayer({ id, routeGeoJson }: RouteLayerProps) {
  // react-map-gl's Source component expects a full GeoJSON Feature or FeatureCollection.
  // We'll wrap our LineString geometry into a Feature object.
  const geoJsonSource: GeoJSON.Feature<LineString> = {
    type: "Feature",
    geometry: routeGeoJson,
    properties: {},
  };

  return (
    <Source id={id} type="geojson" data={geoJsonSource}>
      <Layer
        id={`${id}-layer`}
        type="line"
        source={id}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": "#3b82f6", // A vibrant blue (Tailwind's blue-500)
          "line-width": 5,
          "line-opacity": 0.8,
        }}
      />
    </Source>
  );
}
