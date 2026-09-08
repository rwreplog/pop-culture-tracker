"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { markInAppNavigation } from "@/lib/navigation-history";

/**
 * Mounted once in the app shell layout, which persists across page
 * navigations within `(app)`. Marks every pathname change after the
 * first as an in-app navigation for `BackButton` to key off of.
 */
export function NavigationHistoryTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    markInAppNavigation();
  }, [pathname]);

  return null;
}
