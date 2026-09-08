import { Palette, Settings, User } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { ReleasedAt } from "@/components/settings/released-at";
import { auth } from "@/lib/auth";
import {
  getUserPreferences,
  userHasPassword,
} from "@/lib/services/users/queries";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Settings}
        title="Settings"
        description="Sign in to manage your account."
      />
    );
  }

  const [hasPassword, preferences] = await Promise.all([
    userHasPassword(session.user.id),
    getUserPreferences(session.user.id),
  ]);
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const commit = process.env.NEXT_PUBLIC_APP_COMMIT;
  const releasedAt = process.env.NEXT_PUBLIC_APP_RELEASED_AT;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Palette className="text-muted-foreground size-4" />
          <h2 className="font-medium">Appearance</h2>
        </div>
        <AppearanceForm
          initialTheme={preferences?.theme ?? "system"}
          initialAccentColor={preferences?.accentColor ?? "blue"}
          initialFontFamily={preferences?.fontFamily ?? "space-grotesk"}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <User className="text-muted-foreground size-4" />
          <h2 className="font-medium">Account</h2>
        </div>
        {hasPassword ? (
          <ChangePasswordForm />
        ) : (
          <p className="text-muted-foreground text-sm">
            This account doesn&apos;t use a password.
          </p>
        )}
      </div>

      {version ? (
        <p className="text-muted-foreground text-xs">
          Version {version}
          {commit && commit !== "dev" ? ` (${commit})` : ""}
          {releasedAt ? <ReleasedAt releasedAt={releasedAt} /> : ""}
        </p>
      ) : null}
    </div>
  );
}
