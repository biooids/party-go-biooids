"use client";

import { useState } from "react"; // ✅ 1. Import useState to manage the view
import EventList from "@/components/pages/events/EventList";
import DiscoveryMap from "@/components/pages/map/DiscoveryMap";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react"; // ✅ 2. Import icons for the toggle
import { cn } from "@/lib/utils";

export default function EventsPage() {
  // ✅ 3. Add state to track the current view ('map' or 'list')
  const [currentView, setCurrentView] = useState<"map" | "list">("map");

  return (
    // Use a flex container to manage layout
    <div className="flex flex-col h-full -m-6">
      <div className="flex justify-between items-center p-6 pb-2 border-b">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Explore Events</h1>
          <p className="text-muted-foreground">
            Discover parties, meetups, and clubs happening around you.
          </p>
        </div>

        {/* ✅ 4. Add the Map/List toggle buttons */}
        <div className="hidden sm:flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={currentView === "map" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("map")}
          >
            <Map className="mr-2 h-4 w-4" />
            Map
          </Button>
          <Button
            variant={currentView === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("list")}
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {/* ✅ 5. Conditionally render the selected component */}
      <div className="flex-1">
        {currentView === "map" ? <DiscoveryMap /> : <EventList />}
      </div>
    </div>
  );
}
