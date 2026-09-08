import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { NotificationsBell } from "@/components/layout/notifications-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeaderUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function Header({
  user,
  unreadNotificationCount = 0,
}: {
  user?: HeaderUser;
  unreadNotificationCount?: number;
}) {
  return (
    <header className="bg-background sticky top-0 z-50 flex min-h-14 items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)] md:px-6">
      <Link
        href="/"
        className="focus-visible:ring-ring font-heading flex items-center gap-2 rounded-sm text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
      >
        <Image
          src="/geekery-logo.png"
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0"
          priority
        />
        Geekery
      </Link>

      <div className="flex items-center gap-2">
        {user ? (
          <Link
            href="/discover"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden md:inline-flex",
            )}
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add
          </Link>
        ) : null}
        {user ? (
          <NotificationsBell initialUnreadCount={unreadNotificationCount} />
        ) : null}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
