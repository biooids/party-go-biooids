import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui components path
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui components path

export default function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 lg:py-40">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]" />

      <div className="container mx-auto max-w-screen-xl px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6 text-primary">
          Your Campus Nightlife, Instantly.
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          Discover the best student parties, bar deals, and events happening
          around you. Stop searching, start partying.
        </p>

        {/* Search Bar using shadcn/ui components */}
        <div className="max-w-xl mx-auto">
          <div className="relative flex items-center shadow-lg rounded-full">
            <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter your university or city..."
              className="pl-12 h-14 rounded-full bg-card/70 text-base focus-visible:ring-primary focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              className="absolute right-2 h-11 rounded-full px-6"
            >
              <Search className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Find</span>
            </Button>
          </div>
        </div>

        <div>
          <Button>Discover now </Button>
          <Button>Browse events</Button>
        </div>
      </div>
    </section>
  );
}
