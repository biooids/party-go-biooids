"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavLinks } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth"; // ✅ 1. Import the useAuth hook

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { user } = useAuth(); // ✅ 2. Get the current authenticated user

  // ✅ 3. Filter links based on role BEFORE slicing to get the top 5 visible links.
  const bottomNavLinks = mainNavLinks
    .filter((link) => {
      return !link.roles || (user && link.roles.includes(user.systemRole));
    })
    .slice(0, 5);

  return (
    <div className="fixed bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="grid h-16 grid-cols-5 items-center justify-center text-xs">
        {bottomNavLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 pt-2 pb-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px]">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
