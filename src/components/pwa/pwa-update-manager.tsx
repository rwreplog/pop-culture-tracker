"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function PwaUpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });

    const checkForUpdate = () => {
      registration?.update().catch(() => {});
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // A new worker activating and taking control of an already-open tab means
    // a newer version shipped while the user was here. Silently swapping the
    // page out from under them can break in-progress state, so surface a
    // banner instead of reloading automatically.
    let hadController = Boolean(navigator.serviceWorker.controller);
    const onControllerChange = () => {
      if (hadController) setUpdateAvailable(true);
      hadController = true;
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="bg-primary text-primary-foreground fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 px-4 py-3 text-sm">
      <span>A new version of Geekery is available.</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>
    </div>
  );
}
