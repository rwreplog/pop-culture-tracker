import type { ReactNode } from "react";

import { DesktopNav } from "@/components/layout/desktop-nav";
import { Header, type HeaderUser } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user?: HeaderUser;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Header user={user} />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <DesktopNav />
        <main className="min-w-0 flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
