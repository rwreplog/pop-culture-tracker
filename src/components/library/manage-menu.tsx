"use client";

import {
  Image as ImageIcon,
  ImageOff,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  removeCustomArtAction,
  removeFromLibraryAction,
  uploadCustomArtAction,
} from "@/lib/actions/library";
import { refreshMediaAction } from "@/lib/actions/media";
import { withActionToast } from "@/lib/action-toast";

/**
 * Collapses the library item's less-frequent management actions (custom art,
 * refresh details, remove from library) into a single overflow menu, so the
 * status card doesn't share the screen with two more full-width Cards below
 * it on mobile. Each destructive/dialog action nests a Dialog inside the
 * dropdown menu (Base UI's supported pattern for this): the trigger renders
 * as the menu item itself via `render`, with `closeOnClick={false}` so the
 * click that opens the dialog doesn't fight the menu's own close-on-click.
 */
export function ManageMenu({
  libraryItemId,
  mediaId,
  hasCustomArt,
  className,
}: {
  libraryItemId: string;
  mediaId: string;
  hasCustomArt: boolean;
  className?: string;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removeArtOpen, setRemoveArtOpen] = useState(false);
  const [removeItemOpen, setRemoveItemOpen] = useState(false);

  const [uploadState, uploadAction, isUploading] = useActionState(
    withActionToast(uploadCustomArtAction, "Art uploaded"),
    undefined,
  );
  const [removeArtState, removeArtAction, isRemovingArt] = useActionState(
    withActionToast(removeCustomArtAction, "Art removed"),
    undefined,
  );
  const [, refreshAction, isRefreshing] = useActionState(
    withActionToast(refreshMediaAction, "Details refreshed"),
    undefined,
  );
  const [removeItemState, removeItemAction, isRemovingItem] = useActionState(
    withActionToast(removeFromLibraryAction, "Removed from library"),
    undefined,
  );

  const wasUploading = useRef(false);
  const wasRemovingArt = useRef(false);
  const wasRemovingItem = useRef(false);

  useEffect(() => {
    if (wasUploading.current && !isUploading && !uploadState?.error) {
      setUploadOpen(false);
    }
    wasUploading.current = isUploading;
  }, [isUploading, uploadState]);

  useEffect(() => {
    if (wasRemovingArt.current && !isRemovingArt && !removeArtState?.error) {
      setRemoveArtOpen(false);
    }
    wasRemovingArt.current = isRemovingArt;
  }, [isRemovingArt, removeArtState]);

  useEffect(() => {
    if (wasRemovingItem.current && !isRemovingItem && !removeItemState?.error) {
      setRemoveItemOpen(false);
    }
    wasRemovingItem.current = isRemovingItem;
  }, [isRemovingItem, removeItemState]);

  function handleRefresh() {
    const formData = new FormData();
    formData.set("mediaId", mediaId);
    startTransition(() => refreshAction(formData));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Manage"
            className={className}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger render={<DropdownMenuItem closeOnClick={false} />}>
            <ImageIcon />
            {hasCustomArt ? "Replace art" : "Upload art"}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {hasCustomArt ? "Replace custom art" : "Upload custom art"}
              </DialogTitle>
              <DialogDescription>
                Only you will see this artwork. JPEG, PNG, WEBP, or GIF, up to
                5MB.
              </DialogDescription>
            </DialogHeader>
            <form action={uploadAction} className="flex flex-col gap-3">
              <input type="hidden" name="libraryItemId" value={libraryItemId} />
              <label className="sr-only" htmlFor="customArtFile">
                Image file
              </label>
              <input
                id="customArtFile"
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
              />
              {uploadState?.error ? (
                <p role="alert" className="text-destructive text-sm">
                  {uploadState.error}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {hasCustomArt ? (
          <Dialog open={removeArtOpen} onOpenChange={setRemoveArtOpen}>
            <DialogTrigger render={<DropdownMenuItem closeOnClick={false} />}>
              <ImageOff />
              Remove custom art
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove custom art?</DialogTitle>
                <DialogDescription>
                  This deletes your uploaded image. The title will go back to
                  showing its default artwork.
                </DialogDescription>
              </DialogHeader>
              <form action={removeArtAction}>
                <input
                  type="hidden"
                  name="libraryItemId"
                  value={libraryItemId}
                />
                {removeArtState?.error ? (
                  <p role="alert" className="text-destructive text-sm">
                    {removeArtState.error}
                  </p>
                ) : null}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRemoveArtOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isRemovingArt}
                  >
                    Remove
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}

        <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
          Refresh details
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <Dialog open={removeItemOpen} onOpenChange={setRemoveItemOpen}>
          <DialogTrigger
            render={
              <DropdownMenuItem closeOnClick={false} variant="destructive" />
            }
          >
            <Trash2 />
            Remove from Library
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove from library?</DialogTitle>
              <DialogDescription>
                This deletes your status, rating, notes, and progress for this
                title. This can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <form action={removeItemAction}>
              <input type="hidden" name="libraryItemId" value={libraryItemId} />
              {removeItemState?.error ? (
                <p role="alert" className="text-destructive text-sm">
                  {removeItemState.error}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRemoveItemOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isRemovingItem}
                >
                  Remove
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
