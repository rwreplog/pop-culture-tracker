import type { ReactNode } from "react";

import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return <AppShell user={session?.user}>{children}</AppShell>;
}
