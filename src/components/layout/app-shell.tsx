import type { ReactNode } from "react";

import { DesktopNav } from "@/components/layout/desktop-nav";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
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
