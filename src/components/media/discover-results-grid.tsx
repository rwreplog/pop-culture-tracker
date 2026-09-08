"use client";

import { useState } from "react";

import { AddToListDialog } from "@/components/lists/add-to-list-dialog";
import { SearchResultCard } from "@/components/media/search-result-card";
import type { NormalizedSearchResult } from "@/lib/services/media/provider-types";

export function DiscoverResultsGrid({
  results,
  alreadyInLibraryKeys,
  ownedLists,
}: {
  results: NormalizedSearchResult[];
  alreadyInLibraryKeys: string[];
  ownedLists: { id: string; name: string }[];
}) {
  const alreadyInLibrary = new Set(alreadyInLibraryKeys);
  const [promptMediaId, setPromptMediaId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.map((item) => (
          <SearchResultCard
            key={`${item.provider}:${item.externalId}`}
            result={item}
            alreadyInLibrary={alreadyInLibrary.has(
              `${item.provider}:${item.externalId}`,
            )}
            onAdded={setPromptMediaId}
          />
        ))}
      </div>
      {promptMediaId ? (
        <AddToListDialog
          mediaId={promptMediaId}
          ownedLists={ownedLists}
          open={promptMediaId !== null}
          onOpenChange={(open) => {
            if (!open) setPromptMediaId(null);
          }}
        />
      ) : null}
    </>
  );
}
