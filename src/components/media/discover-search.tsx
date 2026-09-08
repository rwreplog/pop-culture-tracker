"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SearchInput } from "@/components/ui/search-input";
import type { MediaType } from "@/lib/db/schema/media";
import { mediaTypeLabel } from "@/lib/media/labels";

/**
 * Debounces the query into the `q` URL param so results update as the user
 * types, without a Search button. Mirrors LibraryFilters' debounce pattern,
 * including reading current searchParams from a ref at fire-time so a
 * media-type change made mid-debounce isn't silently reverted.
 */
export function DiscoverSearch({
  initialQuery,
  mediaType,
}: {
  initialQuery: string;
  mediaType: MediaType;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const isFirstRender = useRef(true);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  function pushQuery(query: string) {
    const params = new URLSearchParams(searchParamsRef.current);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => pushQuery(value.trim()), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Clearing (backspacing to empty, or the clear button) updates the URL
  // immediately instead of waiting out the debounce.
  function updateValue(next: string) {
    setValue(next);
    if (!next) pushQuery("");
  }

  return (
    <div>
      <label className="sr-only" htmlFor="discover-query">
        Search
      </label>
      <SearchInput
        id="discover-query"
        value={value}
        onChange={updateValue}
        enterKeyHint="search"
        placeholder={`Search ${mediaTypeLabel(mediaType).toLowerCase()}s…`}
        className="max-w-sm"
      />
    </div>
  );
}
