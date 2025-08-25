"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { mainNavLinks, settingsLink } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth"; // ✅ 1. Import the useAuth hook

export default function MobileSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth(); // ✅ 2. Get the current authenticated user

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>
            <Link href="/" onClick={() => setIsOpen(false)}>
              <span className="">YourApp</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 py-4">
          <nav className="grid gap-2 text-lg font-medium">
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
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-primary",
                      isActive && "bg-muted text-primary"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
          </nav>
        </div>
        <div className="mt-auto border-t pt-4">
          <Link
            href={settingsLink.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-primary",
              pathname === settingsLink.href && "bg-muted text-primary"
            )}
          >
            <settingsLink.icon className="h-5 w-5" />
            {settingsLink.label}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
