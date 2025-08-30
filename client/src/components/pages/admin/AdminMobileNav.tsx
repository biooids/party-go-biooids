// src/components/pages/admin/AdminMobileNav.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  CalendarCheck,
  Users,
  Shapes,
  UserCheck,
} from "lucide-react";

const adminNavLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Event Approvals", icon: CalendarCheck },
  {
    href: "/admin/verification",
    label: "Verification Requests",
    icon: UserCheck,
  },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Shapes },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-2 text-lg font-medium">
          <h2 className="text-lg font-semibold tracking-tight p-4">
            Admin Panel
          </h2>
          {adminNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)} // Close sheet on navigation
                className={cn(
                  "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
