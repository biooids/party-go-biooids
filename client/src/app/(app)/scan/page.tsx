// src/app/(app)/scan/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import QRCodeScanner from "@/components/pages/scan/QRCodeScanner";

export default function ScanPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Protect this route by redirecting if the user is not logged in
  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  // Render nothing while redirecting
  if (!token) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Event Check-in</h1>
        <p className="text-muted-foreground">
          Scan the event's official QR code to verify your attendance and earn
          XP.
        </p>
      </div>
      <div className="mt-8">
        <QRCodeScanner />
      </div>
    </div>
  );
}
