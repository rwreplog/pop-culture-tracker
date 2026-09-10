"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { desktopNavGroups } from "@/components/layout/nav-items";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden flex-col gap-5 md:flex md:w-56 md:shrink-0 md:px-3 md:py-6"
    >
      {desktopNavGroups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <h2 className="text-muted-foreground px-3 text-xs font-medium tracking-wide uppercase">
            {group.label}
          </h2>
          {group.items.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  isActive &&
                    "bg-accent text-accent-foreground dark:from-primary/25 dark:to-accent-2/15 dark:text-foreground dark:bg-linear-to-r dark:ring-1 dark:ring-white/10",
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
        </div>
      ))}
    </nav>
  );
}
