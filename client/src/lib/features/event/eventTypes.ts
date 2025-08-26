// src/lib/features/event/eventTypes.ts

/**
 * Enum for event statuses, mirroring the backend.
 */
export enum EventStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

/**
 * The shape of a single event object returned from the API.
 * Includes populated creator and category information.
 */
export interface Event {
  _id: string;
  name: string;
  description: string;
  address: string;
  date: string; // Dates are transmitted as ISO strings
  price: number;
  imageUrls: string[];
  status: EventStatus;
  isSaved?: boolean;
  commentCount?: number;

  creatorId: {
    _id: string;
    name: string;
    username: string;
    profileImage?: string | null;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * The shape of the data needed to create a new event.
 * This is what the "Create Event" form will produce (excluding the image file).
 */
export interface CreateEventDto {
  name: string;
  description: string;
  address: string;
  date: string; // ISO string
  price: number;
  categoryId: string;
}

/**
 * The shape of the data for updating an event. All fields are optional.
 */
export type UpdateEventDto = Partial<CreateEventDto>;

/**
 * The shape of the API response when fetching multiple events.
 */
export interface GetEventsApiResponse {
  status: string;
  results: number;
  data: {
    events: Event[];
  };
}

/**
 * The shape of the API response when fetching a single event.
 */
export interface GetEventApiResponse {
  status: string;
  data: {
    event: Event;
  };
}

/**
 *  The shape of the API response for fetching the current user's events.
 */
export interface GetMyEventsApiResponse {
  status: string;
  results: number;
  data: {
    events: Event[];
  };
}
