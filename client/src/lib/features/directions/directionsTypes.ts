//src/lib/features/directions/directionsTypes.ts
import { Feature, LineString } from "geojson";

/**
 * The arguments required to fetch directions.
 */
export interface GetDirectionsArgs {
  start: { lng: number; lat: number };
  end: { lng: number; lat: number };
  profile?: "driving" | "walking" | "cycling";
}

/**
 * The shape of the actual route data returned from the backend.
 */
export interface RouteData {
  geometry: LineString; // The GeoJSON LineString to draw on the map
  duration: number; // Travel duration in seconds
  distance: number; // Travel distance in meters
}

/**
 * The full API response structure for a directions request.
 */
export interface DirectionsApiResponse {
  status: string;
  data: {
    route: RouteData;
  };
}
