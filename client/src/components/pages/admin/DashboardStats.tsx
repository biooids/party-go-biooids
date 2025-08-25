// src/components/pages/admin/DashboardStats.tsx

"use client";

import {
  useGetPendingEventsQuery,
  useGetAllUsersQuery,
} from "@/lib/features/admin/adminApiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStats() {
  const { data: eventsData, isLoading: isLoadingEvents } =
    useGetPendingEventsQuery();
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery();

  const pendingEventCount = eventsData?.data.events.length ?? 0;
  const totalUserCount = usersData?.data.users.length ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <Skeleton className="h-8 w-1/4" />
          ) : (
            <div className="text-2xl font-bold">{pendingEventCount}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Events awaiting approval
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <Skeleton className="h-8 w-1/4" />
          ) : (
            <div className="text-2xl font-bold">{totalUserCount}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Registered users on the platform
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
