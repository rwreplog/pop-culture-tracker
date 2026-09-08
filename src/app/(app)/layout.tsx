import type { ReactNode } from "react";

import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { getUnreadNotificationCount } from "@/lib/services/notifications/queries";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const unreadCount = session?.user?.id
    ? await getUnreadNotificationCount(session.user.id)
    : 0;

  return (
    <AppShell user={session?.user} unreadNotificationCount={unreadCount}>
      {children}
    </AppShell>
  );
}
