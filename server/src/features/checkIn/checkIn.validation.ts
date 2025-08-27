// src/features/checkIn/checkIn.validation.ts

import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const hexStringRegex = /^[0-9a-fA-F]+$/;

export const checkInSchema = z.object({
  body: z.object({
    eventId: z.string().regex(objectIdRegex, "Invalid Event ID format."),
    qrCodeSecret: z.string().regex(hexStringRegex, "Invalid QR code format."),
  }),
});
