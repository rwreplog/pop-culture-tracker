"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { desktopNavItems } from "@/components/layout/nav-items";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden flex-col gap-1 md:flex md:w-56 md:shrink-0 md:px-3 md:py-6"
    >
      {desktopNavItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              "before:bg-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:opacity-0 before:transition-opacity",
              isActive && "bg-accent text-accent-foreground before:opacity-100",
            )}
          >
            <item.icon
              className={cn("size-4", isActive && "text-primary")}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
