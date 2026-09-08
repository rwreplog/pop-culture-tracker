/**
 * Whether a client-side route change has happened since this browser tab's
 * app layout last mounted. `document.referrer` can't answer this: it's
 * fixed at the tab's original full-page load and never updates across
 * client-side (SPA) navigations, so it only tells us how the tab itself
 * was entered, not whether the *current* page has in-app history behind
 * it. This module-level flag tracks that directly, driven by
 * NavigationHistoryTracker mounted once in the app shell layout, which
 * persists across page navigations and only resets on a full reload.
 */
let hasNavigatedInApp = false;

export function markInAppNavigation() {
  hasNavigatedInApp = true;
}

export function hasInAppHistory() {
  return hasNavigatedInApp;
}
