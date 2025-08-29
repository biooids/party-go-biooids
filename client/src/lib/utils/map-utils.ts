import { WebMercatorViewport } from "@math.gl/web-mercator";
import { LngLatBounds, LngLatBoundsLike } from "mapbox-gl";

/**
 * Calculates the optimal viewport to fit a given GeoJSON LineString geometry.
 * @param geometry The LineString geometry of the route.
 * @param width The width of the map container.
 * @param height The height of the map container.
 * @returns A new view state { longitude, latitude, zoom }.
 */
export function getBoundsForRoute(
  geometry: GeoJSON.LineString,
  width: number,
  height: number
) {
  // Get all the points from the route
  const coordinates = geometry.coordinates;

  // Calculate the bounding box that contains all points
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord as [number, number]);
  }, new LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

  const { longitude, latitude, zoom } = new WebMercatorViewport({
    width,
    height,
  }).fitBounds(bounds.toArray() as [[number, number], [number, number]], {
    padding: 80, // Add some padding in pixels
  });

  return { longitude, latitude, zoom };
}
