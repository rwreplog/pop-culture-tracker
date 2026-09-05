import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="bg-background/95 sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:px-6">
      <Link
        href="/"
        className="focus-visible:ring-ring rounded-sm text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
      >
        Geekery
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar className="size-8">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
