import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { signOutAction } from "@/lib/auth/actions";
import type { HeaderUser } from "@/components/layout/header";

function initials(user: HeaderUser) {
  const source = user.name ?? user.email ?? "?";
  return source.charAt(0).toUpperCase();
}

export function UserMenu({ user }: { user?: HeaderUser }) {
  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Account menu"
          >
            <Avatar className="size-8">
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback>{initials(user)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-medium">{user.name ?? "Account"}</span>
            {user.email ? (
              <span className="text-muted-foreground text-xs font-normal">
                {user.email}
              </span>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href="/settings" className="w-full">
              Settings
            </Link>
          }
        />
        <form action={signOutAction}>
          <DropdownMenuItem
            render={<button type="submit" className="w-full" />}
          >
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
