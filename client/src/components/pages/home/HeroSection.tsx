"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchEventsQuery } from "@/lib/features/event/eventApiSlice";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Event } from "@/lib/features/event/eventTypes";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: searchData, isFetching: isSearching } = useSearchEventsQuery(
    debouncedSearchQuery,
    {
      skip: debouncedSearchQuery.length < 2, // Only search if query is long enough
    }
  );

  const searchResults = searchData?.data.events || [];

  return (
    <section className="relative py-20 md:py-32 lg:py-40">
      <div className=" px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6">
          Your Campus Nightlife, <span className="text-primary">Instantly</span>
          .
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          Discover the best student parties, bar deals, and events happening
          around you. Stop searching, start partying.
        </p>

        <div className="max-w-xl mx-auto relative">
          <div className="relative flex items-center shadow-lg rounded-full">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for an event by name..."
              className="pl-12 h-14 rounded-full bg-card/70 backdrop-blur-sm text-base focus-visible:ring-primary focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-4 h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
          {searchQuery.length > 1 && (
            <div className="absolute z-20 top-full mt-2 w-full bg-card border rounded-lg shadow-xl text-left max-h-72 overflow-y-auto">
              {searchResults.length > 0
                ? searchResults.map((event) => (
                    <Link
                      key={event._id}
                      href={`/events/${event._id}`}
                      className="flex items-center gap-4 p-3 hover:bg-muted"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {event.imageUrls?.[0] && (
                          <Image
                            src={event.imageUrls[0]}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{event.name}</p>
                        {/* ✅ ADDED: Show the creator's username for context */}
                        <p className="text-xs text-muted-foreground">
                          by @{event.creatorId.username}
                        </p>
                      </div>
                    </Link>
                  ))
                : !isSearching && (
                    <p className="p-4 text-sm text-center text-muted-foreground">
                      No events found for "{searchQuery}"
                    </p>
                  )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
