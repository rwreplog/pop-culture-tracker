import { Toast } from "@base-ui/react/toast";

/**
 * A standalone manager, not tied to React context, so any client component
 * can call `toast.success(...)` / `toast.error(...)` directly (in an
 * effect, an event handler, wherever) without needing to be a descendant of
 * a specific provider instance. `<Toaster />` just renders whatever's in it.
 */
export const toastManager = Toast.createToastManager();

export const toast = {
  success: (title: string) => toastManager.add({ title, type: "success" }),
  error: (title: string) => toastManager.add({ title, type: "error" }),
};
