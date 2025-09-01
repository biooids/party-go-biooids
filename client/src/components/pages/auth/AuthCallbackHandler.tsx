// FILE: src/components/pages/auth/AuthCallbackHandler.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useHandleOAuthMutation } from "@/lib/features/auth/authApiSlice";
import { useAppDispatch } from "@/lib/hooks/hooks";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [handleOAuth] = useHandleOAuthMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      handleOAuth({ provider: "google", code })
        .unwrap()
        .then((result) => {
          dispatch(
            setCredentials({
              user: result.data.user,
              token: result.data.accessToken,
            })
          );
          router.push("/");
        })
        .catch((err) => {
          setError(
            err.data?.message || "An unknown error occurred during sign-in."
          );
        });
    } else {
      setError("Invalid authentication callback. Authorization code missing.");
    }
  }, [searchParams, router, dispatch, handleOAuth]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">
        Finalizing your sign-in, please wait...
      </p>
    </div>
  );
}
