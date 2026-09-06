import { Settings } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";

function formatReleasedAt(releasedAt: string | undefined): string | null {
  if (!releasedAt) return null;
  const date = new Date(releasedAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SettingsPage() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const commit = process.env.NEXT_PUBLIC_APP_COMMIT;
  const releasedAt = formatReleasedAt(process.env.NEXT_PUBLIC_APP_RELEASED_AT);

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
            {releasedAt ? ` · Released ${releasedAt}` : ""}
          </p>
        ) : undefined
      }
    />
  );
}
