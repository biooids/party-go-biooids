// src/app/(app)/admin/layout.tsx

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { SystemRole } from "@/lib/features/auth/authTypes";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdminNav from "@/components/pages/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  // Show a loading state or null if user data isn't available yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        {/* You can replace this with a proper skeleton loader */}
        <p>Loading...</p>
      </div>
    );
  }

  // Check if the user has the required role
  const isAuthorized =
    user.systemRole === SystemRole.ADMIN ||
    user.systemRole === SystemRole.SUPER_ADMIN;

  if (!isAuthorized) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have the necessary permissions to view this page.
          </AlertDescription>
          <Button asChild className="mt-4">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  // If authorized, render the admin layout with its own navigation
  return (
    <div className="flex flex-1">
      <AdminNav />
      <main className="flex-1 p-6 bg-muted/40">{children}</main>
    </div>
  );
}
