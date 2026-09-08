"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * Reconciles the client's resolved theme with the account's stored value
 * once, on first mount after hydration. Without this, a theme changed on
 * another device would never take effect here — next-themes prioritizes
 * whatever's already in this browser's localStorage over the server-
 * rendered default, so a stale local value would silently win forever.
 */
export function ThemeSync({
  initialTheme,
}: {
  initialTheme?: "light" | "dark" | "system";
}) {
  const { theme, setTheme } = useTheme();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current || !initialTheme || !theme) return;
    hasSynced.current = true;
    if (theme !== initialTheme) setTheme(initialTheme);
  }, [theme, initialTheme, setTheme]);

  return null;
}
