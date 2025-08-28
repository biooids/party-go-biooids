"use client";

import { useState } from "react";
import Scanner from "react-qr-barcode-scanner";
import { useCheckInMutation } from "@/lib/features/checkIn/checkInApiSlice";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function QRCodeScanner() {
  const [checkIn, { isLoading }] = useCheckInMutation();
  const [isScanning, setIsScanning] = useState(true);
  const router = useRouter();

  const handleUpdate = (err: any, result: any) => {
    if (result) {
      if (isLoading || !isScanning) {
        return;
      }

      setIsScanning(false);

      try {
        const decodedText = result.getText();
        const url = new URL(decodedText);
        const eventId = url.searchParams.get("eventId");
        const qrCodeSecret = url.searchParams.get("secret");

        if (!eventId || !qrCodeSecret) {
          throw new Error("Invalid QR code format.");
        }

        const promise = checkIn({ eventId, qrCodeSecret }).unwrap();

        toast.promise(promise, {
          loading: "Verifying your check-in...",
          success: (response) => {
            router.push(`/events/${eventId}`);
            return `Check-in successful! You earned 10 XP. New total: ${response.data.newXpTotal}`;
          },
          error: (err) => {
            setIsScanning(true);
            return err.data?.message || "Check-in failed.";
          },
        });
      } catch (error) {
        toast.error("Invalid QR code. Please scan an official event QR code.");
        setIsScanning(true);
      }
    }
  };

  const handleError = (error: string | DOMException) => {
    console.error("QR Scanner Error:", error);
    toast.error("Could not initialize camera. Please check permissions.");
  };

  return (
    <Card>
      <CardContent className="p-2">
        {isScanning ? (
          <Scanner onUpdate={handleUpdate} onError={handleError} />
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Processing check-in...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
