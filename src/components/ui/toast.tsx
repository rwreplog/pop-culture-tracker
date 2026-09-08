"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "cn";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { toastManager } from "@/lib/toast";

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      data-slot="toast"
      className={cn(
        "bg-popover text-popover-foreground ring-foreground/10 flex items-start gap-2 rounded-lg p-3 text-sm shadow-md ring-1",
        "translate-x-(--toast-swipe-movement-x,0) translate-y-(--toast-swipe-movement-y,0)",
        "motion-safe:transition-[opacity,translate] motion-safe:duration-200",
        "motion-safe:data-starting-style:translate-y-2 motion-safe:data-starting-style:opacity-0",
        "motion-safe:data-ending-style:opacity-0",
      )}
    >
      {toast.type === "error" ? (
        <XCircle
          className="text-destructive mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
      ) : (
        <CheckCircle2
          className="mt-0.5 size-4 shrink-0 text-emerald-500"
          aria-hidden="true"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <ToastPrimitive.Title data-slot="toast-title" className="font-medium" />
        <ToastPrimitive.Description
          data-slot="toast-description"
          className="text-muted-foreground text-xs"
        />
      </div>
      <ToastPrimitive.Close
        data-slot="toast-close"
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground -m-1 shrink-0 rounded-sm p-1 outline-none"
      >
        <X className="size-3.5" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  ));
}

/** Mounted once at the app root; toasts are triggered from anywhere via `toast` in `@/lib/toast`. */
export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          data-slot="toast-viewport"
          className="fixed top-[calc(env(safe-area-inset-top)+4.5rem)] right-4 z-100 flex w-72 flex-col gap-2 outline-none"
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
