"use client";

import { AlertTriangle } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { Button } from "@/components/ui/button";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PlaceholderScreen
      icon={AlertTriangle}
      title="Something went wrong"
      description="An unexpected error occurred. You can try again, or come back later."
      action={<Button onClick={() => reset()}>Try again</Button>}
    />
  );
}
