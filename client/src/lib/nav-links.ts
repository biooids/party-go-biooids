// src/lib/nav-links.ts

import {
  Home,
  Settings,
  User as UserIcon,
  Compass,
  ShieldCheck,
  PlusSquare, // ✅ 1. Import a new icon for the "Create Event" button
  type LucideIcon,
} from "lucide-react";
import { SystemRole } from "@/lib/features/auth/authTypes";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: SystemRole[];
};

// The main array of navigation links for the sidebar
export const mainNavLinks: NavLink[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/events",
    label: "Explore",
    icon: Compass,
  },
  {
    href: "/profile/me",
    label: "My Profile",
    icon: UserIcon,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: ShieldCheck,
    roles: [SystemRole.ADMIN, SystemRole.SUPER_ADMIN],
  },
];

export const createEventLink: NavLink = {
  href: "/events/create",
  label: "Create Event",
  icon: PlusSquare,
};

export const settingsLink: NavLink = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};
