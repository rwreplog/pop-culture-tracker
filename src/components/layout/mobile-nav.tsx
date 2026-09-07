"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { mobileNavItems } from "@/components/layout/nav-items";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="bg-background/95 fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur md:hidden"
    >
      {mobileNavItems.map((item) => {
        const path = item.href.split("?")[0];
        const isActive =
          path === "/" ? pathname === "/" : pathname.startsWith(path);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-16 flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium",
              "text-muted-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              isActive && "text-foreground",
            )}
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
