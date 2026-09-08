"use client";

import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A search box with a built-in clear button, shown once there's text to clear. */
export function SearchInput({
  value,
  onChange,
  className,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type">) {
  return (
    <div className={cn("relative", className)}>
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(value && "pr-8")}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
