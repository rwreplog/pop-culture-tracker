import type { ReactNode } from "react";

import { DesktopNav } from "@/components/layout/desktop-nav";
import { Header, type HeaderUser } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavigationHistoryTracker } from "@/components/layout/navigation-history-tracker";

export function AppShell({
  children,
  user,
  unreadNotificationCount = 0,
}: {
  children: ReactNode;
  user?: HeaderUser;
  unreadNotificationCount?: number;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <NavigationHistoryTracker />
      <Header user={user} unreadNotificationCount={unreadNotificationCount} />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <DesktopNav />
        <main className="min-w-0 flex-1 px-4 pt-6 pb-28 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
