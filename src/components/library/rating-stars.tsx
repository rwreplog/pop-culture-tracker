"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const STAR_COUNT = 5;

/**
 * Half-star click picker. `value` and the values passed to `onChange` are
 * raw half-star units (0-10) to match the rating column's storage format.
 */
export function RatingStars({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      className="flex items-center gap-2"
      onMouseLeave={() => setHover(null)}
    >
      <div role="radiogroup" aria-label="Rating" className="flex gap-0.5">
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const starIndex = i + 1;
          const fullValue = starIndex * 2;
          const halfValue = fullValue - 1;
          const fillFraction =
            display >= fullValue ? 1 : display >= halfValue ? 0.5 : 0;

          return (
            <div key={starIndex} className="relative flex size-6">
              <Star
                className="text-muted-foreground/40 size-6"
                aria-hidden="true"
              />
              {fillFraction > 0 ? (
                <Star
                  className="text-primary absolute inset-0 size-6"
                  fill="currentColor"
                  style={
                    fillFraction === 0.5
                      ? { clipPath: "inset(0 50% 0 0)" }
                      : undefined
                  }
                  aria-hidden="true"
                />
              ) : null}
              <button
                type="button"
                disabled={disabled}
                role="radio"
                aria-checked={value === halfValue}
                aria-label={`Rate ${halfValue / 2} stars`}
                className="absolute inset-y-0 left-0 w-1/2 disabled:cursor-not-allowed"
                onMouseEnter={() => setHover(halfValue)}
                onFocus={() => setHover(halfValue)}
                onClick={() => onChange(value === halfValue ? 0 : halfValue)}
              />
              <button
                type="button"
                disabled={disabled}
                role="radio"
                aria-checked={value === fullValue}
                aria-label={`Rate ${fullValue / 2} stars`}
                className="absolute inset-y-0 right-0 w-1/2 disabled:cursor-not-allowed"
                onMouseEnter={() => setHover(fullValue)}
                onFocus={() => setHover(fullValue)}
                onClick={() => onChange(value === fullValue ? 0 : fullValue)}
              />
            </div>
          );
        })}
      </div>
      <span
        className={cn(
          "text-muted-foreground w-14 text-xs tabular-nums",
          value === 0 && "opacity-0",
        )}
      >
        {value > 0 ? `${value / 2} / 5` : "0 / 5"}
      </span>
    </div>
  );
}
