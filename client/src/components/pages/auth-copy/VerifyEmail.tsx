"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/lib/features/email/emailApiSlice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const VerifyEmailComponent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verificationInitiated = useRef(false);

  const [verifyEmail] = useVerifyEmailMutation();
  const [verificationStatus, setVerificationStatus] = useState<{
    type: "loading" | "error" | "success";
    message: string;
  }>({
    type: "loading",
    message: "Verifying your email, please wait...",
  });

  useEffect(() => {
    if (verificationInitiated.current) {
      return;
    }
    verificationInitiated.current = true;

    const handleVerification = async () => {
      if (!token) {
        setVerificationStatus({
          type: "error",
          message: "No verification token found. Please check your link.",
        });
        return;
      }

      try {
        const response = await verifyEmail({ token }).unwrap();
        setVerificationStatus({ type: "success", message: response.message });
      } catch (err: any) {
        const errorMessage =
          err?.data?.message ||
          "An unknown error occurred during verification.";
        setVerificationStatus({ type: "error", message: errorMessage });
      }
    };

    handleVerification();
  }, [token, verifyEmail]);

  // --- THIS IS THE FIX ---
  // A function to handle the button click, forcing a full page load.
  const handleProceed = () => {
    // Using window.location.href triggers a full page reload and navigation,
    // which clears all cached data and solves the stale banner issue.
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verificationStatus.type === "loading" && (
            <div className="flex flex-col items-center gap-4 p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>{verificationStatus.message}</p>
            </div>
          )}
          {verificationStatus.type === "success" && (
            <div className="flex flex-col items-center gap-4 p-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="font-medium">{verificationStatus.message}</p>

              {/* The button now calls our new handler */}
              <Button onClick={handleProceed} className="mt-4">
                Continue to App
              </Button>
            </div>
          )}
          {verificationStatus.type === "error" && (
            <div className="flex flex-col items-center gap-4 p-8">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium text-destructive">
                Verification Failed
              </p>
              <p className="text-muted-foreground">
                {verificationStatus.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// We wrap the component in Suspense because useSearchParams requires it.
export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailComponent />
    </Suspense>
  );
}
