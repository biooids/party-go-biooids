"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsNavLinks = [
  {
    href: "/settings",
    label: "Account",
  },
  {
    href: "/settings/security",
    label: "Security",
  },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:space-x-4 border-b">
      {settingsNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
            pathname === link.href && "border-primary text-primary"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
