import {
  Activity,
  ListChecks,
  Moon,
  Settings,
  Target,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth/actions";
import { getUserById } from "@/lib/services/users/queries";
import { cn } from "@/lib/utils";

const CONTENT_LINKS = [
  { href: "/tonight", label: "Tonight", icon: Moon },
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

/**
 * A tappable icon tile for the nav grid below — same visual language as
 * Home's HomeActionCard, adapted to a 2-up grid instead of a full-width
 * row since these are single-word destinations, not action+description.
 */
function ProfileNavTile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="ring-foreground/10 bg-muted/40 hover:bg-muted/70 active:bg-muted/70 flex touch-manipulation flex-col items-center gap-2 rounded-xl p-4 text-center ring-1 transition-colors active:scale-[0.98] dark:bg-white/[0.045] dark:ring-white/12 dark:hover:bg-white/[0.07] dark:active:bg-white/[0.07]"
    >
      <div className="bg-background dark:from-primary/30 dark:to-accent-2/25 flex size-10 items-center justify-center rounded-full dark:bg-linear-to-br">
        <Icon
          className="text-muted-foreground dark:text-foreground size-5"
          aria-hidden="true"
        />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
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

      {/* Navigation first — this page exists to reach what's not already
          in the mobile tab bar, so lead with that instead of the (less
          frequently used) profile-editing form below. */}
      <nav aria-label="Profile" className="grid grid-cols-2 gap-3">
        {CONTENT_LINKS.map((link) => (
          <ProfileNavTile
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
          />
        ))}
      </nav>

      <div className="border-border flex flex-col gap-2 border-t pt-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="border-border flex flex-col gap-3 border-t pt-4">
        <h2 className="text-sm font-semibold">Edit profile</h2>
        <EditProfileForm
          handle={profile?.handle ?? null}
          bio={profile?.bio ?? null}
        />
      </div>
    </div>
  );
}
