// src/app/(app)/admin/page.tsx

"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user?.name}. Here you can manage events, users, and other
        platform settings.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Dashboard stat cards will go here in the future */}
        <div className="p-4 border rounded-lg bg-card text-card-foreground">
          <h3 className="font-semibold">Pending Events</h3>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="p-4 border rounded-lg bg-card text-card-foreground">
          <h3 className="font-semibold">Total Users</h3>
          <p className="text-2xl font-bold">--</p>
        </div>
      </div>
    </div>
  );
}
