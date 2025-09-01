// FILE: src/app/auth/callback/page.tsx

import AuthCallbackHandler from "@/components/pages/auth/AuthCallbackHandler";
import { Suspense } from "react";

// This page component creates the /auth/callback route
export default function AuthCallbackPage() {
  return (
    // The Suspense boundary is required for useSearchParams to work correctly.
    <Suspense>
      <AuthCallbackHandler />
    </Suspense>
  );
}
