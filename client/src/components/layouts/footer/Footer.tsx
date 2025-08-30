// src/components/layouts/footer/Footer.tsx

import Link from "next/link";
import { PartyPopper, Twitter, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto max-w-screen-xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Branding */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <PartyPopper className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PartyGo</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your ultimate guide to campus nightlife. Discover, connect, and
              party.
            </p>
          </div>

          {/* Column 2: Key Links */}
          <div>
            <h3 className="font-semibold mb-4">Navigate</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Explore Events
                </Link>
              </li>
              <li>
                <Link
                  href="/events/create"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Create an Event
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Socials */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
            <div className="flex items-center gap-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NightOwl Inc. · All rights reserved.
        </div>
      </div>
    </footer>
  );
}
