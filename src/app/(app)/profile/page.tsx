import {
  Activity,
  ListChecks,
  Settings,
  Target,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth/actions";
import { getUserById } from "@/lib/services/users/queries";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/lists", label: "Lists", icon: ListChecks },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initials(name?: string | null, email?: string | null) {
  const source = name ?? email ?? "?";
  return source.charAt(0).toUpperCase();
}

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <PlaceholderScreen
        icon={User}
        title="Profile"
        description="Sign in to see your account and profile details."
      />
    );
  }

  const profile = await getUserById(user.id);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback className="text-lg">
            {initials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">
            {user.name ?? "Account"}
          </p>
          {user.email ? (
            <p className="text-muted-foreground truncate text-sm">
              {user.email}
            </p>
          ) : null}
          {profile?.handle ? (
            <Link
              href={`/u/${profile.handle}`}
              className="text-primary text-sm hover:underline"
            >
              View public profile
            </Link>
          ) : null}
        </div>
      </div>

      <EditProfileForm
        handle={profile?.handle ?? null}
        bio={profile?.bio ?? null}
      />

      <nav aria-label="Profile" className="flex flex-col gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-border hover:bg-muted flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
            )}
          >
            <link.icon className="text-muted-foreground size-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <form action={signOutAction}>
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
