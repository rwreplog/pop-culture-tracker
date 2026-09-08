"use server";

import { auth } from "@/lib/auth";
import { markAllRead } from "@/lib/services/notifications/mutations";

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return;

  await markAllRead(session.user.id);
}
