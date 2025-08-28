// src/lib/features/checkIn/checkInTypes.ts

/**
 * The shape of the data sent to the backend when a user checks in.
 */
export interface CheckInDto {
  eventId: string;
  qrCodeSecret: string;
}

/**
 * The shape of the data in the API response after a successful check-in.
 */
export interface CheckInResponseData {
  message: string;
  newXpTotal: number;
}

/**
 * The shape of the entire API response for a successful check-in.
 */
export interface CheckInApiResponse {
  status: string;
  data: CheckInResponseData;
}
