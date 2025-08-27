// src/features/map/map.types.ts

// A GeoJSON Point geometry
interface Point {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// The properties of a place returned by the Mapbox API
interface MapboxPlaceProperties {
  mapbox_id: string;
  name: string;
  address?: string;
  category?: string;
  [key: string]: any; // Allows for other properties
}

// A single feature (a place or location) in a Mapbox API response
export interface MapboxFeature {
  type: "Feature";
  id: string;
  geometry: Point;
  properties: MapboxPlaceProperties;
  place_name: string;
  center: [number, number];
}

// The overall shape of the response from the Mapbox Geocoding API
export interface MapboxGeocodingResponse {
  type: "FeatureCollection";
  features: MapboxFeature[];
}
