import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns true only after the client has hydrated. Use to defer rendering
 * of UI that depends on client-only state (e.g. resolved theme) and would
 * otherwise mismatch between server and client markup.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
