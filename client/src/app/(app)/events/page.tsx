// src/app/(app)/events/page.tsx

"use client";

import EventList from "@/components/pages/events/EventList";

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
        <p className="text-muted-foreground">
          Discover parties, meetups, and clubs happening around you.
        </p>
      </div>
      <EventList />
    </div>
  );
}
