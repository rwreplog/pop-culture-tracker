"use client";

import { Heart } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LibraryItem } from "@/lib/db/schema/library";
import type { MediaType } from "@/lib/db/schema/media";
import { libraryStatusLabel } from "@/lib/media/labels";
import {
  addToLibraryAction,
  removeFromLibraryAction,
  toggleFavoriteAction,
  updateNotesAction,
  updateProgressAction,
  updateRatingAction,
  updateStatusAction,
} from "@/lib/actions/library";

const STATUSES = [
  "want",
  "in_progress",
  "completed",
  "paused",
  "abandoned",
] as const;

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3";

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
    return <AddToLibraryForm mediaId={mediaId} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusForm libraryItemId={libraryItem.id} mediaType={mediaType} status={libraryItem.status} />
        <RatingForm libraryItemId={libraryItem.id} rating={libraryItem.rating} />
        <FavoriteForm
          libraryItemId={libraryItem.id}
          isFavorite={libraryItem.isFavorite}
        />
      </div>
      <ProgressForm
        libraryItemId={libraryItem.id}
        mediaType={mediaType}
        progress={libraryItem.progress as Record<string, unknown> | null}
      />
      <NotesForm libraryItemId={libraryItem.id} notes={libraryItem.notes} />
      <RemoveForm libraryItemId={libraryItem.id} />
    </div>
  );
}

function AddToLibraryForm({ mediaId }: { mediaId: string }) {
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
      <select
        id="add-status"
        name="status"
        defaultValue="want"
        className={selectClassName}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {libraryStatusLabel(status, "movie")}
          </option>
        ))}
      </select>
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

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <label className="sr-only" htmlFor="status">
        Status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={status}
        className={selectClassName}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {STATUSES.map((value) => (
          <option key={value} value={value}>
            {libraryStatusLabel(value, mediaType)}
          </option>
        ))}
      </select>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
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

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <label className="sr-only" htmlFor="rating">
        Rating
      </label>
      <select
        id="rating"
        name="rating"
        defaultValue={rating ?? ""}
        className={selectClassName}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">No rating</option>
        {RATING_OPTIONS.filter((value) => value > 0).map((value) => (
          <option key={value} value={value}>
            {ratingLabel(value)}
          </option>
        ))}
      </select>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
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
        <Heart
          className="size-4"
          fill={isFavorite ? "currentColor" : "none"}
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
      <div className="flex flex-wrap items-end gap-2">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs" htmlFor={field.name}>
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              defaultValue={
                progress?.[field.name] != null
                  ? String(progress[field.name])
                  : ""
              }
              className={`${selectClassName} w-28`}
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

function RemoveForm({ libraryItemId }: { libraryItemId: string }) {
  const [state, formAction, isPending] = useActionState(
    removeFromLibraryAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="libraryItemId" value={libraryItemId} />
      <Button type="submit" variant="outline" disabled={isPending}>
        Remove from Library
      </Button>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
