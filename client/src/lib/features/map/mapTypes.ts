// src/lib/features/map/mapTypes.ts

// A GeoJSON Point geometry
interface Point {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// A single feature (a place or location) in the API response
export interface MapPlaceFeature {
  type: "Feature";
  id: string;
  geometry: Point;
  place_name: string;
  center: [number, number];
  properties: {
    mapbox_id: string;
    name?: string;
    address?: string;
    category?: string;
  };
}

// The overall shape of the API response from your backend's map endpoints
export interface MapApiResponse {
  status: string;
  data: {
    features: MapPlaceFeature[];
  };
}
