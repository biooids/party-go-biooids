// src/app/(app)/settings/page.tsx

"use client";

import ChangePasswordForm from "@/components/pages/settings/ChangePasswordForm";
import DangerZone from "@/components/pages/settings/DangerZone";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Protect this route by redirecting if the user is not logged in
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Render nothing while redirecting to prevent a flash of content
  if (!token) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and security.
        </p>
      </div>
      <ChangePasswordForm />
      <DangerZone />
    </div>
  );
}
