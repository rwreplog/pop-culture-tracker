"use client";

import { Heart } from "lucide-react";
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
  updateCompletedAtAction,
  updateNotesAction,
  updateProgressAction,
  updateRatingAction,
  updateStatusAction,
  uploadCustomArtAction,
} from "@/lib/actions/library";

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
}: {
  mediaId: string;
  mediaType: MediaType;
  libraryItem: LibraryItem | null;
}) {
  if (!libraryItem) {
    return <AddToLibraryForm mediaId={mediaId} mediaType={mediaType} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <StatusForm
          libraryItemId={libraryItem.id}
          mediaType={mediaType}
          status={libraryItem.status}
        />
        <RatingForm
          libraryItemId={libraryItem.id}
          rating={libraryItem.rating}
        />
        <FavoriteForm
          libraryItemId={libraryItem.id}
          isFavorite={libraryItem.isFavorite}
        />
      </div>
      {libraryItem.status === "completed" ? (
        <CompletedAtForm
          libraryItemId={libraryItem.id}
          completedAt={libraryItem.completedAt}
        />
      ) : null}
      <ProgressForm
        libraryItemId={libraryItem.id}
        mediaType={mediaType}
        progress={libraryItem.progress as Record<string, unknown> | null}
      />
      <NotesForm libraryItemId={libraryItem.id} notes={libraryItem.notes} />
      <CustomArtForm
        libraryItemId={libraryItem.id}
        hasCustomArt={Boolean(libraryItem.customImageKey)}
      />
      <RemoveForm libraryItemId={libraryItem.id} />
    </div>
  );
}

function AddToLibraryForm({
  mediaId,
  mediaType,
}: {
  mediaId: string;
  mediaType: MediaType;
}) {
  const [state, formAction, isPending] = useActionState(
    addToLibraryAction,
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
  const [state, formAction] = useActionState(updateStatusAction, undefined);

  function handleValueChange(value: (typeof STATUSES)[number] | null) {
    if (!value) return;
    const formData = new FormData();
    formData.set("libraryItemId", libraryItemId);
    formData.set("status", value);
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="status">
        Status
      </label>
      <Select defaultValue={status} onValueChange={handleValueChange}>
        <SelectTrigger id="status">
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

const RATING_OPTIONS = Array.from({ length: 11 }, (_, value) => value);

function ratingLabel(value: number): string {
  if (value === 0) return "No rating";
  const stars = value / 2;
  return `${stars} star${stars === 1 ? "" : "s"}`;
}

function RatingForm({
  libraryItemId,
  rating,
}: {
  libraryItemId: string;
  rating: number | null;
}) {
  const [state, formAction] = useActionState(updateRatingAction, undefined);
  const NO_RATING = "none";

  function handleValueChange(value: string | null) {
    if (!value) return;
    const formData = new FormData();
    formData.set("libraryItemId", libraryItemId);
    formData.set("rating", value === NO_RATING ? "" : value);
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="rating">
        Rating
      </label>
      <Select
        defaultValue={rating ? String(rating) : NO_RATING}
        onValueChange={handleValueChange}
      >
        <SelectTrigger id="rating">
          <SelectValue>
            {(value: string) =>
              value === NO_RATING ? "No rating" : ratingLabel(Number(value))
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_RATING}>No rating</SelectItem>
          {RATING_OPTIONS.filter((value) => value > 0).map((value) => (
            <SelectItem key={value} value={String(value)}>
              {ratingLabel(value)}
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
  const [state, formAction] = useActionState(
    updateCompletedAtAction,
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
    toggleFavoriteAction,
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

function NotesForm({
  libraryItemId,
  notes,
}: {
  libraryItemId: string;
  notes: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateNotesAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <label className="text-sm font-medium" htmlFor="notes">
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

function ProgressForm({
  libraryItemId,
  mediaType,
  progress,
}: {
  libraryItemId: string;
  mediaType: MediaType;
  progress: Record<string, unknown> | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateProgressAction,
    undefined,
  );

  const fields = progressFieldsFor(mediaType);
  if (fields.length === 0) return null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <input type="hidden" name="mediaType" value={mediaType} />
      <span className="text-sm font-medium">Progress</span>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label
              className="text-muted-foreground text-xs"
              htmlFor={field.name}
            >
              {field.label}
            </label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              inputMode={field.type === "number" ? "numeric" : undefined}
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
      </div>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function progressFieldsFor(
  mediaType: MediaType,
): { name: string; label: string; type: "number" | "text" }[] {
  switch (mediaType) {
    case "tv":
      return [
        { name: "season", label: "Season", type: "number" },
        { name: "episode", label: "Episode", type: "number" },
      ];
    case "book":
      return [
        { name: "page", label: "Page", type: "number" },
        { name: "percent", label: "Percent", type: "number" },
      ];
    case "game":
      return [
        { name: "percent", label: "Percent", type: "number" },
        { name: "note", label: "Note", type: "text" },
      ];
    case "comic":
      return [
        { name: "issue", label: "Issue", type: "number" },
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
    uploadCustomArtAction,
    undefined,
  );
  const [removeState, removeAction, isRemoving] = useActionState(
    removeCustomArtAction,
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

function RemoveForm({ libraryItemId }: { libraryItemId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    removeFromLibraryAction,
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" className="self-start" />}
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
