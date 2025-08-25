// src/components/pages/admin/AdminNav.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Shapes,
  UserCheck,
} from "lucide-react";

const adminNavLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/events",
    label: "Event Approvals",
    icon: CalendarCheck,
  },
  {
    href: "/admin/verification",
    label: "Verification Requests",
    icon: UserCheck,
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: Users,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Shapes,
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 flex-col border-r bg-background shrink-0 md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold tracking-tight">Admin Panel</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="grid items-start gap-1 text-sm font-medium">
          {adminNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
