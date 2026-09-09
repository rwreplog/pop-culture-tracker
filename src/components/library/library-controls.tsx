"use client";

import { Heart, RefreshCw, ShoppingBag } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { RatingStars } from "@/components/library/rating-stars";
import { AddToListDialog } from "@/components/lists/add-to-list-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LibraryItem } from "@/lib/db/schema/library";
import type { MediaType } from "@/lib/db/schema/media";
import { libraryStatusLabel } from "@/lib/media/labels";
import {
  addToLibraryAction,
  removeCustomArtAction,
  removeFromLibraryAction,
  toggleFavoriteAction,
  toggleWantToOwnAction,
  updateCompletedAtAction,
  updateNotesAction,
  updateProgressAction,
  updateRatingAction,
  updateStatusAction,
  uploadCustomArtAction,
  type LibraryActionState,
} from "@/lib/actions/library";
import { refreshMediaAction } from "@/lib/actions/media";
import { withActionToast } from "@/lib/action-toast";

const STATUSES = [
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
] as const;

export function LibraryControls({
  mediaId,
  mediaType,
  libraryItem,
  pageCount,
  issueCount,
  ownedLists,
}: {
  mediaId: string;
  mediaType: MediaType;
  libraryItem: LibraryItem | null;
  /** Total pages, from Google Books — gives the book progress form a denominator. */
  pageCount?: number;
  /** Total issues in the series, from ComicVine — same, for comics. */
  issueCount?: number;
  ownedLists: { id: string; name: string }[];
}) {
  const [showListPrompt, setShowListPrompt] = useState(false);

  const listPrompt = (
    <AddToListDialog
      mediaId={mediaId}
      ownedLists={ownedLists}
      open={showListPrompt}
      onOpenChange={setShowListPrompt}
    />
  );

  if (!libraryItem) {
    return (
      <Card variant="glass">
        <CardContent>
          <AddToLibraryForm
            mediaId={mediaId}
            mediaType={mediaType}
            onAdded={() => setShowListPrompt(true)}
          />
        </CardContent>
        {listPrompt}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {listPrompt}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Your status</CardTitle>
          <CardAction className="flex gap-2">
            <WantToOwnForm
              libraryItemId={libraryItem.id}
              wantToOwn={libraryItem.wantToOwn}
            />
            <FavoriteForm
              libraryItemId={libraryItem.id}
              isFavorite={libraryItem.isFavorite}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <StatusForm
            libraryItemId={libraryItem.id}
            mediaType={mediaType}
            status={libraryItem.status}
          />
          <RatingForm
            libraryItemId={libraryItem.id}
            rating={libraryItem.rating}
          />
          {libraryItem.status === "completed" ? (
            <CompletedAtForm
              libraryItemId={libraryItem.id}
              completedAt={libraryItem.completedAt}
            />
          ) : null}
        </CardContent>
      </Card>

      <ProgressForm
        libraryItemId={libraryItem.id}
        mediaType={mediaType}
        progress={libraryItem.progress as Record<string, unknown> | null}
        pageCount={pageCount}
        issueCount={issueCount}
      />

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesForm libraryItemId={libraryItem.id} notes={libraryItem.notes} />
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Manage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CustomArtForm
            libraryItemId={libraryItem.id}
            hasCustomArt={Boolean(libraryItem.customImageKey)}
          />
          <RefreshDetailsForm mediaId={mediaId} />
        </CardContent>
      </Card>

      <Card className="ring-destructive/20">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <RemoveForm libraryItemId={libraryItem.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function AddToLibraryForm({
  mediaId,
  mediaType,
  onAdded,
}: {
  mediaId: string;
  mediaType: MediaType;
  onAdded: () => void;
}) {
  // addToLibraryAction's revalidatePath swaps this whole form out for the
  // "in library" management UI as soon as the action resolves, which can
  // unmount this component in the same commit that would've flipped
  // isPending to false — so an effect here can't be relied on to fire (see
  // withActionToast's doc comment for the same race). Call onAdded from
  // inside the action wrapper itself instead, before that swap happens.
  const [state, formAction, isPending] = useActionState(
    async (prevState: LibraryActionState, formData: FormData) => {
      const result = await withActionToast(
        addToLibraryAction,
        "Added to library",
      )(prevState, formData);
      if (!result?.error) onAdded();
      return result;
    },
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="mediaId" value={mediaId} />
      <label className="sr-only" htmlFor="add-status">
        Status
      </label>
      <Select name="status" defaultValue="want">
        <SelectTrigger id="add-status">
          <SelectValue>
            {(value: (typeof STATUSES)[number]) =>
              libraryStatusLabel(value, mediaType)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {libraryStatusLabel(status, mediaType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isPending}>
        Add to Library
      </Button>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function StatusForm({
  libraryItemId,
  mediaType,
  status,
}: {
  libraryItemId: string;
  mediaType: MediaType;
  status: (typeof STATUSES)[number];
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(updateStatusAction, "Status updated"),
    undefined,
  );

  function handleValueChange(value: (typeof STATUSES)[number] | null) {
    if (!value) return;
    const formData = new FormData();
    formData.set("libraryItemId", libraryItemId);
    formData.set("status", value);
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-muted-foreground text-xs font-medium"
        htmlFor="status"
      >
        Status
      </label>
      <Select
        defaultValue={status}
        onValueChange={handleValueChange}
        disabled={isPending}
      >
        <SelectTrigger id="status" className="w-full sm:w-64">
          <SelectValue>
            {(value: (typeof STATUSES)[number]) =>
              libraryStatusLabel(value, mediaType)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {libraryStatusLabel(value, mediaType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

function RatingForm({
  libraryItemId,
  rating,
}: {
  libraryItemId: string;
  rating: number | null;
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(updateRatingAction, "Rating saved"),
    undefined,
  );

  function handleChange(value: number) {
    const formData = new FormData();
    formData.set("libraryItemId", libraryItemId);
    formData.set("rating", value === 0 ? "" : String(value));
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium">Rating</span>
      <RatingStars
        value={rating ?? 0}
        onChange={handleChange}
        disabled={isPending}
      />
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function CompletedAtForm({
  libraryItemId,
  completedAt,
}: {
  libraryItemId: string;
  completedAt: Date | null;
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(updateCompletedAtAction, "Date updated"),
    undefined,
  );

  function handleChange(value: string) {
    const formData = new FormData();
    formData.set("libraryItemId", libraryItemId);
    formData.set("completedAt", value);
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium" htmlFor="completedAt">
        Date finished
      </label>
      <Input
        id="completedAt"
        type="date"
        defaultValue={toDateInputValue(completedAt)}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isPending}
        className="w-40"
      />
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

function FavoriteForm({
  libraryItemId,
  isFavorite,
}: {
  libraryItemId: string;
  isFavorite: boolean;
}) {
  const [, formAction, isPending] = useActionState(
    withActionToast(
      toggleFavoriteAction,
      isFavorite ? "Removed from favorites" : "Added to favorites",
    ),
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <input type="hidden" name="isFavorite" value={String(!isFavorite)} />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        disabled={isPending}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className="size-4" fill={isFavorite ? "currentColor" : "none"} />
      </Button>
    </form>
  );
}

function WantToOwnForm({
  libraryItemId,
  wantToOwn,
}: {
  libraryItemId: string;
  wantToOwn: boolean;
}) {
  const [, formAction, isPending] = useActionState(
    withActionToast(
      toggleWantToOwnAction,
      wantToOwn ? "Removed from want-to-own list" : "Added to want-to-own list",
    ),
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <input type="hidden" name="wantToOwn" value={String(!wantToOwn)} />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        disabled={isPending}
        aria-pressed={wantToOwn}
        aria-label={
          wantToOwn ? "Remove from want-to-own list" : "Add to want-to-own list"
        }
      >
        <ShoppingBag
          className="size-4"
          fill={wantToOwn ? "currentColor" : "none"}
        />
      </Button>
    </form>
  );
}

function NotesForm({
  libraryItemId,
  notes,
}: {
  libraryItemId: string;
  notes: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(updateNotesAction, "Notes saved"),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <label className="sr-only" htmlFor="notes">
        Notes
      </label>
      <Textarea
        id="notes"
        name="notes"
        defaultValue={notes ?? ""}
        placeholder="Private notes only you can see"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" variant="outline" disabled={isPending}>
          Save notes
        </Button>
        {state?.error ? (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/** The progress field a known total (pageCount/issueCount) applies to, per media type. */
const PRIMARY_PROGRESS_FIELD: Partial<Record<MediaType, string>> = {
  book: "page",
  comic: "issue",
};

function ProgressForm({
  libraryItemId,
  mediaType,
  progress,
  pageCount,
  issueCount,
}: {
  libraryItemId: string;
  mediaType: MediaType;
  progress: Record<string, unknown> | null;
  /** Total pages, from Google Books — lets the "page" field show a total and a bar. */
  pageCount?: number;
  /** Total issues in the series, from ComicVine — same, for the "issue" field. */
  issueCount?: number;
}) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(updateProgressAction, "Progress saved"),
    undefined,
  );

  const total = mediaType === "book" ? pageCount : issueCount;
  const fields = progressFieldsFor(mediaType, total);
  if (fields.length === 0) return null;

  const primaryField = PRIMARY_PROGRESS_FIELD[mediaType];
  const current =
    primaryField && progress?.[primaryField] != null
      ? Number(progress[primaryField])
      : null;
  const percent =
    total && current != null
      ? Math.min(100, Math.round((current / total) * 100))
      : null;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {total ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">
              {current ?? 0} of {total}
              {percent != null ? ` (${percent}%)` : ""}
            </span>
            <div
              className="bg-muted h-1.5 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={percent ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="bg-primary h-full"
                style={{ width: `${percent ?? 0}%` }}
              />
            </div>
          </div>
        ) : null}
        <form
          action={formAction}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <input type="hidden" name="libraryItemId" value={libraryItemId} />
          <input type="hidden" name="mediaType" value={mediaType} />
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label
                className="text-muted-foreground text-xs font-medium"
                htmlFor={field.name}
              >
                {field.label}
              </label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                inputMode={field.type === "number" ? "numeric" : undefined}
                max={field.max}
                defaultValue={
                  progress?.[field.name] != null
                    ? String(progress[field.name])
                    : ""
                }
                className="w-28"
              />
            </div>
          ))}
          <Button type="submit" variant="outline" disabled={isPending}>
            Save progress
          </Button>
          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function progressFieldsFor(
  mediaType: MediaType,
  total?: number,
): { name: string; label: string; type: "number" | "text"; max?: number }[] {
  switch (mediaType) {
    case "tv":
      return [
        { name: "season", label: "Season", type: "number" },
        { name: "episode", label: "Episode", type: "number" },
      ];
    case "book":
      return [
        {
          name: "page",
          label: total ? `Page (of ${total})` : "Page",
          type: "number",
          max: total,
        },
        { name: "percent", label: "Percent", type: "number" },
      ];
    case "game":
      return [
        { name: "percent", label: "Percent", type: "number" },
        { name: "note", label: "Note", type: "text" },
      ];
    case "comic":
      return [
        {
          name: "issue",
          label: total ? `Issue (of ${total})` : "Issue",
          type: "number",
          max: total,
        },
        { name: "volume", label: "Volume", type: "number" },
      ];
    case "movie":
      return [];
  }
}

function CustomArtForm({
  libraryItemId,
  hasCustomArt,
}: {
  libraryItemId: string;
  hasCustomArt: boolean;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [uploadState, uploadAction, isUploading] = useActionState(
    withActionToast(uploadCustomArtAction, "Art uploaded"),
    undefined,
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    withActionToast(removeCustomArtAction, "Art removed"),
    undefined,
  );
  const wasUploading = useRef(false);
  const wasRemoving = useRef(false);

  useEffect(() => {
    if (wasUploading.current && !isUploading && !uploadState?.error) {
      setUploadOpen(false);
    }
    wasUploading.current = isUploading;
  }, [isUploading, uploadState]);

  useEffect(() => {
    if (wasRemoving.current && !isRemoving && !removeState?.error) {
      setRemoveOpen(false);
    }
    wasRemoving.current = isRemoving;
  }, [isRemoving, removeState]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Custom art</span>
      <div className="flex items-center gap-2">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger render={<Button variant="outline" type="button" />}>
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
          <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
            <DialogTrigger render={<Button variant="outline" type="button" />}>
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
              <form action={removeAction}>
                <input
                  type="hidden"
                  name="libraryItemId"
                  value={libraryItemId}
                />
                {removeState?.error ? (
                  <p role="alert" className="text-destructive text-sm">
                    {removeState.error}
                  </p>
                ) : null}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRemoveOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isRemoving}
                  >
                    Remove
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
    </div>
  );
}

function RefreshDetailsForm({ mediaId }: { mediaId: string }) {
  const [state, formAction, isPending] = useActionState(
    withActionToast(refreshMediaAction, "Details refreshed"),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="mediaId" value={mediaId} />
      <div className="flex items-center gap-2">
        <Button type="submit" variant="outline" disabled={isPending}>
          <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
          Refresh details
        </Button>
        {state?.error ? (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function RemoveForm({ libraryItemId }: { libraryItemId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    withActionToast(removeFromLibraryAction, "Removed from library"),
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="destructive" className="self-start" />}
      >
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
        <form action={formAction}>
          <input type="hidden" name="libraryItemId" value={libraryItemId} />
          {state?.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              Remove
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
