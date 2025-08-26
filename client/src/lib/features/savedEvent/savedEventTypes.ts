// src/lib/features/savedEvent/savedEventTypes.ts

import { Event } from "../event/eventTypes";

/**
 * The shape of the API response when fetching the current user's saved events.
 */
export interface GetMySavedEventsApiResponse {
  status: string;
  results: number;
  data: {
    events: Event[];
  };
}
