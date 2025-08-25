// src/components/layout/Header.tsx

"use client";

import { useMemo } from "react"; // ✅ 1. Import useMemo
import Link from "next/link";
import UserNav from "./UserNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { Bell } from "lucide-react";
import MobileSidebar from "../sidebar/MobileSidebar";

/**
 * A helper function to get a greeting based on the current time of day.
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Header() {
  const { user } = useAuth();
  // ✅ 2. Memoize greeting to prevent re-calculating on every render
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-16 items-center p-5">
        {/* Left Side: Logo & Mobile Nav */}
        <div className="flex items-center">
          <div className="md:hidden mr-2">
            <MobileSidebar />
          </div>
          <Link href="/" className="hidden md:flex items-center space-x-2">
            <span className="font-bold">YourApp</span>
          </Link>
        </div>

        {/* Center: Welcome Message (hidden on small screens) */}
        <div className="flex-1 justify-center hidden md:flex">
          <p className="text-sm text-muted-foreground">
            {greeting}
            {user ? `, ${user.name}` : ""}
          </p>
        </div>

        {/* Right Side: Actions & User Nav */}
        {/* ✅ 3. Use gap for more robust spacing vs. space-x */}
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
