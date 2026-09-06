import type { CountEntry } from "@/lib/services/insights/queries";

/** A horizontal bar list for ranked name/count pairs (genres, creators). */
export function CountBarList({ entries }: { entries: CountEntry[] }) {
  const max = Math.max(1, ...entries.map((entry) => entry.count));

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.name} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm sm:w-40">
            {entry.name}
          </span>
          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${(entry.count / max) * 100}%` }}
            />
          </div>
          <span className="text-muted-foreground w-6 shrink-0 text-right text-sm">
            {entry.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
