// src/lib/nav-links.ts

import {
  Home,
  Settings,
  User as UserIcon,
  Compass,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SystemRole } from "@/lib/features/auth/authTypes"; // Imports from the file you just updated

// Define a type for navigation links to ensure consistency
export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: SystemRole[]; // Optional roles array for permission checks
};

// The main array of navigation links
export const mainNavLinks: NavLink[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/explore",
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

export const settingsLink: NavLink = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};
