import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from "@/lib/services/notifications/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [unreadCount, notifications] = await Promise.all([
    getUnreadNotificationCount(session.user.id),
    getRecentNotifications(session.user.id),
  ]);

  return NextResponse.json({ unreadCount, notifications });
}
