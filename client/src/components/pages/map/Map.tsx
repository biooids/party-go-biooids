"use client";

import ReactMapGL, {
  MapProvider,
  type ViewStateChangeEvent,
  type MapMouseEvent,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  children?: React.ReactNode;
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onMove: (evt: ViewStateChangeEvent) => void;
  onClick?: (evt: MapMouseEvent) => void;
}

export default function Map({
  viewState,
  onMove,
  onClick,
  children,
}: MapProps) {
  return (
    <MapProvider>
      <ReactMapGL
        {...viewState}
        onMove={onMove}
        onClick={onClick} // ✅ Pass the onClick handler to the map library
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </ReactMapGL>
    </MapProvider>
  );
}
