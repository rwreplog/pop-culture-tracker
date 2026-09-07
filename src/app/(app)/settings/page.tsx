import { Settings } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { ReleasedAt } from "@/components/settings/released-at";

export default function SettingsPage() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const commit = process.env.NEXT_PUBLIC_APP_COMMIT;
  const releasedAt = process.env.NEXT_PUBLIC_APP_RELEASED_AT;

  return (
    <PlaceholderScreen
      icon={Settings}
      title="Settings"
      description="Account, profile, and privacy preferences will live here."
      action={
        version ? (
          <p className="text-muted-foreground text-xs">
            Version {version}
            {commit && commit !== "dev" ? ` (${commit})` : ""}
            {releasedAt ? <ReleasedAt releasedAt={releasedAt} /> : ""}
          </p>
        ) : undefined
      }
    />
  );
}
