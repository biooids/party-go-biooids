// src/components/pages/home/CTASection.tsx

import { ArrowRight, PartyPopper, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-card border-t border-border relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/10 via-pink-500/5 to-teal-400/10 blur-3xl" />

      <div className="container mx-auto max-w-screen-lg px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
          Ready to Dive In? 🎉
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
          Whether you're looking for the best party or you're the one creating
          it, we've got you covered.
        </p>

        {/* ✅ Card-based CTA grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Card 1: For Partygoers */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <PartyPopper className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>For Partygoers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Access a curated list of the hottest student events, get
                exclusive deals, and never miss a night out again. Your next
                unforgettable experience is just a click away.
              </CardDescription>
              <Button asChild className="w-full sm:w-auto font-semibold">
                <Link href="/events">
                  Explore Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: For Creators */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>For Creators</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Got an event? Get the word out. List your party, club night, or
                gathering on our platform to reach thousands of students on
                campus and sell more tickets.
              </CardDescription>
              <Button asChild className="w-full sm:w-auto font-semibold">
                <Link href="/events/create">
                  List Your Event <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
