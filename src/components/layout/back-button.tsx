"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { hasInAppHistory } from "@/lib/navigation-history";
import { cn } from "@/lib/utils";

/**
 * Goes back in history when the current page was reached via an in-app
 * client-side navigation; falls back to a fixed destination for a direct
 * visit (bookmark, typed URL, external link) where there's nothing in-app
 * to go back to.
 */
export function BackButton({
  fallbackHref,
  label = "Back",
  iconOnly = false,
  className,
}: {
  fallbackHref: string;
  label?: string;
  /** Renders as an unlabeled icon button — for floating over a hero image, say. */
  iconOnly?: boolean;
  className?: string;
}) {
  const router = useRouter();

  function handleClick() {
    if (hasInAppHistory()) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={iconOnly ? "icon-sm" : "sm"}
      aria-label={iconOnly ? label : undefined}
      className={cn(!iconOnly && "w-fit", className)}
      onClick={handleClick}
    >
      <ArrowLeft
        data-icon={iconOnly ? undefined : "inline-start"}
        className="size-4"
        aria-hidden="true"
      />
      {iconOnly ? null : label}
    </Button>
  );
}
