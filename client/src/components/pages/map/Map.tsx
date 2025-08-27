"use client";

import ReactMapGL, { MapProvider, ViewStateChangeEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  children?: React.ReactNode;
  // ✅ CHANGED: This is now the controlled view state, not just the initial one.
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  // ✅ ADDED: A function to call when the map is moved.
  onMove: (evt: ViewStateChangeEvent) => void;
}

export default function Map({ viewState, onMove, children }: MapProps) {
  return (
    <MapProvider>
      <ReactMapGL
        {...viewState}
        onMove={onMove} // ✅ Pass the onMove handler to the map.
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </ReactMapGL>
    </MapProvider>
  );
}
