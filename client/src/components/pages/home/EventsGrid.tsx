"use client"; // <-- Required for using React Hooks like useState

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils"; // <-- Import cn utility for conditional classes

// Import shadcn/ui components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // <-- Import the Skeleton component

// Define the type for an event for better type safety
type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  price: string;
};

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Neon Nights Party",
    date: "Aug 30, 2025",
    location: "Club Vibe, Downtown",
    image:
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "Free entry",
  },
  {
    id: 2,
    title: "Student Beer Fest",
    date: "Sep 2, 2025",
    location: "Campus Bar",
    image:
      "https://images.unsplash.com/photo-1509057199576-632a47484ece?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$5 wristband",
  },
  {
    id: 3,
    title: "Hip-Hop Takeover",
    date: "Sep 5, 2025",
    location: "Underground Lounge",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$10",
  },
  // ... other events
  {
    id: 4,
    title: "Silent Disco",
    date: "Sep 8, 2025",
    location: "University Quad",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "Free",
  },
  {
    id: 5,
    title: "Latin Dance Night",
    date: "Sep 10, 2025",
    location: "Bar Sol",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$7",
  },
  {
    id: 6,
    title: "EDM Rave",
    date: "Sep 12, 2025",
    location: "Warehouse District",
    image:
      "https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$15",
  },
];

/**
 * A self-contained card component that manages its own loading state.
 */
function EventCard({ event }: { event: Event }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {/* Skeleton is shown while the image is loading */}
          <Skeleton className={cn("h-full w-full", !isLoading && "hidden")} />
          <Image
            src={event.image}
            alt={event.title}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <>
            <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {event.date}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-5 pt-0">
        {isLoading ? (
          <Skeleton className="h-6 w-1/4" />
        ) : (
          <span className="text-lg font-bold text-primary">{event.price}</span>
        )}
        <Button disabled={isLoading}>View</Button>
      </CardFooter>
    </Card>
  );
}

/**
 * The main grid component that renders the list of event cards.
 */
export default function EventsGrid() {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">
          Upcoming Events 🎶
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
