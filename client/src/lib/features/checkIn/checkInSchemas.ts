// src/lib/features/checkIn/checkInSchemas.ts

import { z } from "zod";

export const checkInFormSchema = z.object({
  eventId: z.string().min(1, "Event ID is required."),
  qrCodeSecret: z.string().min(1, "QR Code Secret is required."),
});

export type CheckInFormValues = z.infer<typeof checkInFormSchema>;
