import type { NormalizedSearchResult } from "@/lib/services/media/provider-types";

/** Hidden inputs encoding a NormalizedSearchResult for actions bound to a form (resolveMediaAction, quickAddToLibraryAction). */
export function HiddenResultFields({
  result,
}: {
  result: NormalizedSearchResult;
}) {
  return (
    <>
      <input type="hidden" name="provider" value={result.provider} />
      <input type="hidden" name="externalId" value={result.externalId} />
      <input type="hidden" name="mediaType" value={result.mediaType} />
      <input type="hidden" name="title" value={result.title} />
      <input
        type="hidden"
        name="releaseDate"
        value={result.releaseDate ?? ""}
      />
      <input type="hidden" name="imageUrl" value={result.imageUrl ?? ""} />
      <input type="hidden" name="creator" value={result.creator ?? ""} />
      <input
        type="hidden"
        name="description"
        value={result.description ?? ""}
      />
      <input
        type="hidden"
        name="genres"
        value={JSON.stringify(result.genres)}
      />
    </>
  );
}
