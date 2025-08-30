// src/lib/features/map/mapTypes.ts

// A GeoJSON Point geometry
interface Point {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// A single feature (a place or location) in a Geocoding API response
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

// The overall shape of the API response from the /geocode endpoint
export interface MapApiResponse {
  status: string;
  data: {
    features: MapPlaceFeature[];
  };
}

/**
 * A single suggestion from the Search Box API /suggest endpoint.
 */
export interface MapSuggestion {
  name: string;
  mapbox_id: string;
  feature_type: string;
  address: string;
  full_address: string;
  place_formatted: string;

  // ✅ The detailed 'context' property is correctly placed here.
  context?: {
    geo?: {
      longitude: number;
      latitude: number;
    };
    place?: {
      longitude: number;
      latitude: number;
    };
    address?: {
      longitude: number;
      latitude: number;
    };
  } | null;
}

/**
 * The overall shape of the API response from your backend's /maps/search endpoint.
 */
export interface MapSuggestionsApiResponse {
  status: string;
  data: {
    suggestions: MapSuggestion[];
  };
}
