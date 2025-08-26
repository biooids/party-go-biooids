// src/lib/nav-links.ts

import {
  Home,
  Settings,
  User as UserIcon,
  Compass,
  ShieldCheck,
  PlusSquare,
  ClipboardList, // ✅ 1. Import a new icon for "My Events"
  type LucideIcon,
} from "lucide-react";
import { SystemRole } from "@/lib/features/auth/authTypes";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: SystemRole[];
  // ✅ 2. Add a new property to check for verification status
  requiresVerification?: boolean;
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
  // ✅ 3. ADDED: The new link to the "My Events" page
  {
    href: "/my-events",
    label: "My Events",
    icon: ClipboardList,
    requiresVerification: true, // This link will only show for creators/admins
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
