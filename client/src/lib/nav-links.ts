// src/lib/nav-links.ts

import {
  Home,
  Settings,
  User as UserIcon,
  Compass,
  ShieldCheck,
  PlusSquare,
  ClipboardList,
  Bookmark,
  QrCode,
  type LucideIcon,
  Map,
} from "lucide-react";
import { SystemRole } from "@/lib/features/auth/authTypes";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: SystemRole[];
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
  // ✅ 2. ADDED: The new link to the "Saved Events" page
  {
    href: "/saved-events",
    label: "Saved Events",
    icon: Bookmark,
  },
  {
    href: "/my-events",
    label: "My Events",
    icon: ClipboardList,
    requiresVerification: true,
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
  {
    href: "/map",
    label: "map",
    icon: Map,
  },
  {
    href: "/scan",
    label: "Scan",
    icon: QrCode,
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
