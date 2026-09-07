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
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
    >
      <div className="bg-background/85 ring-foreground/10 flex w-full max-w-sm items-center justify-around rounded-full py-1.5 shadow-lg ring-1 backdrop-blur-xl dark:bg-white/[0.06] dark:shadow-[0_20px_45px_-20px_oklch(0.1_0.04_264/0.9)] dark:ring-white/12">
        {mobileNavItems.map((item) => {
          const path = item.href.split("?")[0];
          const isActive =
            path === "/" ? pathname === "/" : pathname.startsWith(path);

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "-mt-6 flex size-13 shrink-0 items-center justify-center rounded-full",
                  "bg-primary text-primary-foreground shadow-lg",
                  "dark:from-primary dark:to-accent-2 dark:bg-linear-to-br",
                  "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                )}
              >
                <item.icon className="size-6" aria-hidden="true" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-full px-2 py-2 text-xs font-medium",
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
      </div>
    </nav>
  );
}
