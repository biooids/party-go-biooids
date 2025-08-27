"use client";

import SettingsNav from "@/components/pages/settings/SettingsNav";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  // Render nothing while redirecting to prevent a flash of content
  if (!token) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, security, and verification status.
        </p>
      </div>
      <SettingsNav />
      <div className="pt-4">{children}</div>
    </div>
  );
}
