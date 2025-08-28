// src/components/pages/my-events/EventQRCode.tsx

"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface EventQRCodeProps {
  eventId: string;
  qrCodeSecret: string;
}

export default function EventQRCode({
  eventId,
  qrCodeSecret,
}: EventQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // ✅ 1. Construct the URL to be encoded in the QR code.
  // The scanner will read this URL to get the eventId and secret.
  const checkInUrl = `${window.location.origin}/scan?eventId=${eventId}&secret=${qrCodeSecret}`;

  // ✅ 2. Function to handle downloading the QR code as a PNG.
  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `event-${eventId}-qrcode.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Check-in Code</CardTitle>
        <CardDescription>
          Display this QR code at your event venue for attendees to scan and
          check in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <div ref={qrRef}>
          <QRCodeCanvas
            value={checkInUrl}
            size={256}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={false}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardFooter>
    </Card>
  );
}
