"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavLinks, settingsLink } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth"; // ✅ 1. Import the useAuth hook

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth(); // ✅ 2. Get the current authenticated user

  return (
    <aside className="hidden h-full w-64 flex-col border-r bg-background shrink-0 md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="">YourApp</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start gap-1 p-4 text-sm font-medium">
          {/* ✅ 3. Filter the links based on user role before mapping */}
          {mainNavLinks
            .filter((link) => {
              return (
                !link.roles || (user && link.roles.includes(user.systemRole))
              );
            })
            .map((link) => {
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
      <div className="mt-auto p-4">
        <Link
          href={settingsLink.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === settingsLink.href && "bg-muted text-primary"
          )}
        >
          <settingsLink.icon className="h-4 w-4" />
          {settingsLink.label}
        </Link>
      </div>
    </aside>
  );
}
