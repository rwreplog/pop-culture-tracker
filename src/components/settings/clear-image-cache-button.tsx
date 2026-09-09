"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/**
 * Poster/cover art is cached by the service worker (public/sw.js) in its
 * own IMAGE_CACHE_NAME bucket, not the browser's regular disk cache, so
 * clearing it needs a message round-trip to the active worker rather than
 * a plain Cache Storage call from the page.
 */
export function ClearImageCacheButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClear() {
    if (!("serviceWorker" in navigator)) {
      toast.error("Image caching isn't available in this browser.");
      return;
    }

    setPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const controller = registration.active;
      if (!controller) {
        toast.error("No active service worker to clear.");
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => reject(new Error("timeout")), 5000);
        channel.port1.onmessage = () => {
          clearTimeout(timeout);
          resolve();
        };
        controller.postMessage({ type: "CLEAR_IMAGE_CACHE" }, [channel.port2]);
      });

      toast.success("Cleared cached images — they'll refetch as you browse.");
      router.refresh();
    } catch {
      toast.error("Couldn't clear the image cache. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClear}
      disabled={pending}
      className="w-fit"
    >
      <RefreshCw
        className={cn("size-4", pending && "animate-spin")}
        aria-hidden="true"
      />
      {pending ? "Clearing…" : "Clear cached images"}
    </Button>
  );
}
