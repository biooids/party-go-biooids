"use client";

import { useMemo } from "react";
import Link from "next/link";
import UserNav from "./UserNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { Bell, PlusSquare } from "lucide-react";
import MobileSidebar from "../sidebar/MobileSidebar";
import { createEventLink } from "@/lib/nav-links";
import { SystemRole } from "@/lib/features/auth/authTypes";
import { ThemeToggler } from "./ThemeToggler";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Header() {
  const { user } = useAuth();
  const greeting = useMemo(() => getGreeting(), []);

  // ✅ FIXED: This check now correctly includes isVerifiedCreator, ADMIN, and SUPER_ADMIN.
  const canCreateEvents =
    user &&
    (user.isVerifiedCreator ||
      user.systemRole === SystemRole.ADMIN ||
      user.systemRole === SystemRole.SUPER_ADMIN);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center p-4 sm:p-5">
        <div className="flex items-center">
          <div className="md:hidden mr-2">
            <MobileSidebar />
          </div>
          <Link href="/" className="hidden md:flex items-center space-x-2">
            <span className="font-bold">PartyGo</span>
          </Link>
        </div>

        <div className="flex-1 justify-center hidden md:flex">
          <p className="text-sm text-muted-foreground">
            {greeting}
            {user ? `, ${user.name}` : ""}
          </p>
        </div>
        <div className="pr-2 flex items-center gap-x-2">
          <ThemeToggler />
        </div>

        <div className="flex items-center justify-end gap-x-2">
          {canCreateEvents && (
            <>
              <Button asChild className="hidden sm:flex">
                <Link href={createEventLink.href}>
                  <PlusSquare className="mr-2 h-4 w-4" />
                  {createEventLink.label}
                </Link>
              </Button>
              <Button asChild size="icon" className="sm:hidden rounded-full">
                <Link href={createEventLink.href}>
                  <PlusSquare className="h-5 w-5" />
                  <span className="sr-only">{createEventLink.label}</span>
                </Link>
              </Button>
            </>
          )}
          {/* <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button> */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
