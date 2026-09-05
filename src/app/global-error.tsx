"use client";

import { AlertTriangle } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col px-4 antialiased">
        <PlaceholderScreen
          icon={AlertTriangle}
          title="Something went wrong"
          description="An unexpected error occurred. You can try again, or come back later."
          action={<Button onClick={() => reset()}>Try again</Button>}
        />
      </body>
    </html>
  );
}
