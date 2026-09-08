"use client";

import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAppearanceAction } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";
import type {
  accentColorEnum,
  fontFamilyEnum,
  themeEnum,
} from "@/lib/db/schema/users";

type Theme = (typeof themeEnum.enumValues)[number];
type AccentColor = (typeof accentColorEnum.enumValues)[number];
type FontFamily = (typeof fontFamilyEnum.enumValues)[number];

const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/** Approximates each accent's --primary token (L 0.5, C 0.18) for the swatch preview. */
const ACCENT_OPTIONS: { value: AccentColor; label: string; hue: number }[] = [
  { value: "blue", label: "Blue", hue: 264 },
  { value: "violet", label: "Violet", hue: 292 },
  { value: "emerald", label: "Emerald", hue: 158 },
  { value: "amber", label: "Amber", hue: 75 },
];

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "bricolage-grotesque", label: "Bricolage Grotesque" },
  { value: "manrope", label: "Manrope" },
  { value: "sora", label: "Sora" },
];

export function AppearanceForm({
  initialTheme,
  initialAccentColor,
  initialFontFamily,
}: {
  initialTheme: Theme;
  initialAccentColor: AccentColor;
  initialFontFamily: FontFamily;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState(initialAccentColor);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);

  async function persist(next: {
    theme: Theme;
    accentColor: AccentColor;
    fontFamily: FontFamily;
  }) {
    await updateAppearanceAction(next);
    router.refresh();
  }

  function handleThemeChange(next: Theme) {
    setTheme(next);
    void persist({ theme: next, accentColor, fontFamily });
  }

  function handleAccentChange(next: AccentColor) {
    setAccentColor(next);
    document.documentElement.setAttribute("data-accent", next);
    void persist({
      theme: (theme as Theme) ?? initialTheme,
      accentColor: next,
      fontFamily,
    });
  }

  function handleFontChange(next: FontFamily) {
    setFontFamily(next);
    document.documentElement.setAttribute("data-font", next);
    void persist({
      theme: (theme as Theme) ?? initialTheme,
      accentColor,
      fontFamily: next,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Theme</span>
        <Select
          value={theme ?? initialTheme}
          onValueChange={(value) => {
            if (value) handleThemeChange(value as Theme);
          }}
        >
          <SelectTrigger aria-label="Theme" className="w-full sm:w-48">
            <SelectValue>{(value: Theme) => THEME_LABELS[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(THEME_LABELS) as Theme[]).map((value) => (
              <SelectItem key={value} value={value}>
                {THEME_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Accent color</span>
        <div className="flex gap-2" role="radiogroup" aria-label="Accent color">
          {ACCENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={accentColor === option.value}
              aria-label={option.label}
              title={option.label}
              onClick={() => handleAccentChange(option.value)}
              className="focus-visible:ring-ring focus-visible:ring-offset-background relative flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: `oklch(0.5 0.18 ${option.hue})`,
              }}
            >
              {accentColor === option.value ? (
                <Check className="size-4 text-white drop-shadow" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Font</span>
        <Select
          value={fontFamily}
          onValueChange={(value) => {
            if (value) handleFontChange(value as FontFamily);
          }}
        >
          <SelectTrigger aria-label="Font" className="w-full sm:w-56">
            <SelectValue>
              {(value: FontFamily) =>
                FONT_OPTIONS.find((option) => option.value === value)?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  option.value === "space-grotesk" &&
                    "font-[var(--font-space-grotesk)]",
                  option.value === "bricolage-grotesque" &&
                    "font-[var(--font-bricolage-grotesque)]",
                  option.value === "manrope" && "font-[var(--font-manrope)]",
                  option.value === "sora" && "font-[var(--font-sora)]",
                )}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
