"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavLinks } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { SystemRole } from "@/lib/features/auth/authTypes"; // ✅ 1. Import SystemRole

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // ✅ 2. Updated filter logic to handle both roles and verification status
  const bottomNavLinks = mainNavLinks
    .filter((link) => {
      const hasRolePermission =
        !link.roles || (user && link.roles.includes(user.systemRole));
      const hasVerificationPermission =
        !link.requiresVerification ||
        (user &&
          (user.isVerifiedCreator || user.systemRole !== SystemRole.USER));
      return hasRolePermission && hasVerificationPermission;
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
