"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";

type NotificationItem = {
  id: string;
  type: "friend_request" | "recommendation" | "goal_achieved";
  actor: { id: string; name: string | null; handle: string | null } | null;
  mediaId: string | null;
  mediaTitle: string | null;
  goalTarget: number | null;
  goalYear: number | null;
  createdAt: string;
};

const POLL_INTERVAL_MS = 30_000;

export function NotificationsBell({
  initialUnreadCount,
}: {
  initialUnreadCount: number;
}) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) return;
      const data = await response.json();
      setUnreadCount(data.unreadCount);
      setNotifications(data.notifications);
      setLoaded(true);
    } catch {
      // Silently ignore — the badge just keeps its last known value.
    }
  }

  useEffect(() => {
    function tick() {
      if (document.visibilityState === "visible") refresh();
    }
    const id = setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  async function handleOpenChange(open: boolean) {
    if (!open) return;
    if (unreadCount > 0) {
      setUnreadCount(0);
      await markAllNotificationsReadAction();
    }
    refresh();
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="size-4" aria-hidden="true" />
            {unreadCount > 0 ? (
              <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-1.5 py-4 text-center text-sm">
            {loaded ? "No notifications yet." : "Loading…"}
          </p>
        ) : (
          notifications.map((notification) => {
            const actorName = notification.actor?.name ?? "Someone";

            if (notification.type === "recommendation") {
              return (
                <DropdownMenuItem
                  key={notification.id}
                  render={
                    <Link
                      href={`/media/${notification.mediaId}`}
                      className="w-full"
                    />
                  }
                >
                  <span className="truncate">
                    <strong className="font-medium">{actorName}</strong>{" "}
                    recommended{" "}
                    <strong className="font-medium">
                      {notification.mediaTitle}
                    </strong>
                  </span>
                </DropdownMenuItem>
              );
            }

            if (notification.type === "goal_achieved") {
              return (
                <DropdownMenuItem
                  key={notification.id}
                  render={<Link href="/goals" className="w-full" />}
                >
                  <span className="truncate">
                    You hit your goal of{" "}
                    <strong className="font-medium">
                      {notification.goalTarget}
                    </strong>{" "}
                    for {notification.goalYear}!
                  </span>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem
                key={notification.id}
                render={<Link href="/friends" className="w-full" />}
              >
                <span className="truncate">
                  <strong className="font-medium">{actorName}</strong> sent you
                  a friend request
                </span>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
