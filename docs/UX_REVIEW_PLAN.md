# UX Review Plan — 2026-09-07

Working plan for a UI/UX polish pass on `feature/ux-review-improvements`, on
top of the v0.3.0 "cinematic glass" redesign. Source: a code-level audit
against `docs/DESIGN_SYSTEM.md` and `docs/UX.md`, cross-checked by hand.
Delete this file once everything below is done and merged.

Status key: `[ ]` not started · `[~]` in progress · `[x]` done

## Already done this session

- [x] Added `e2e/library-filters.spec.ts` covering Library's search, sort,
      and grid/list view toggle (the one gap in e2e coverage for the
      already-implemented Library filters work). Passes standalone and in
      the full suite run serialized.
- [x] Formatted 5 files that had drifted from Prettier (`library-filters.tsx`,
      `queries.ts`, `media-list-row.tsx`, `tonight/page.tsx`, `goal-card.tsx`).
- [x] Extended the glass-card consistency pass (items 2 & 3) to `tonight/page.tsx`'s
      pick card, `goal-card.tsx`, and the Friends page's "Add friend" card, plus
      restyled Friends' plain-bordered `PersonRow` to match the app's glass ring
      treatment — same "no visible logic for why this one's flat" issue found
      on more pages while working through the app.
- [x] Added friendlier per-media-type labels for `want`/`completed` statuses
      (`Want to Watch`/`Want to Play`/`Want to Read`, `Watched`/`Completed`/`Read`)
      in `src/lib/media/labels.ts`, matching the phrasing already promised by
      `docs/PRODUCT.md` — only `in_progress` had per-type labels before.
- [x] Added a `/tonight` link to desktop nav and the Profile page's link list —
      the page existed and worked but had no way to reach it from either.

## Reviewed, no change needed

- `list-card.tsx` / `list-item-row.tsx` (Lists page) and the Profile page's
  nav-link rows use a plain border, not `Card variant="glass"`. Per
  `docs/DESIGN_SYSTEM.md`: "not every card needs to be glass; use it for
  surfaces that should feel elevated/floating." These are dense, repeated
  utility rows, not hero moments — leaving them plain reads as correct, not
  inconsistent.
- Hover glow on every `MediaCard` poster (Library/Discover/Dashboard grids)
  is technically broader than the doc's "reserved for primary actions and
  active/selected states" language, but it's applied uniformly everywhere a
  card appears — reads as a deliberate, consistent choice. Not changing
  without a specific complaint.

## Action items

### 1. Reduced-motion compliance on core UI primitives (quick, mechanical)

`src/components/ui/dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`,
`tooltip.tsx`, `sheet.tsx` all drive open/close with `animate-in`/`fade-in`/
`zoom-in`/`slide-in` utilities with **no** `motion-safe:` gating — every
dialog, dropdown, select, and tooltip in the app ignores
`prefers-reduced-motion`, unlike `media-card.tsx` and `search-result-card.tsx`
which gate correctly. This is the single broadest compliance gap against
"Motion & Interaction" in the design doc.

- [x] Add `motion-safe:` prefixes to the animation utility classes in the
      five files above.

### 2. Glass/flat card inconsistency on Media Detail (quick-medium)

`src/app/(app)/media/[id]/page.tsx` renders a plain "Overview" `Card`
directly above `LibraryControls`'s glass "Your status" card, and the
"Notes"/"Manage" cards further down drop back to plain — four stacked cards,
two visual languages, no visible logic, on the app's flagship content page.

- [x] Make Overview/Notes/Manage cards `variant="glass"` to match "Your
      status" so the whole page reads as one deliberate surface. (Also
      caught and fixed the same issue on `ProgressForm`'s card and the
      "Lists" card, which the original audit note didn't call out by name.)

### 3. Same inconsistency on Stats (quick)

`stats-overview-cards.tsx` and `activity-chart.tsx` use `variant="glass"`;
`annual-summary-card.tsx` (same page, same visual weight) is a plain `Card`.

- [x] Switch `annual-summary-card.tsx` to `variant="glass"`.

### 4. Media Detail: add Activity + Related media, reorganize with Tabs (medium-large)

`docs/UX.md`'s Media Detail checklist lists "Activity" and "Related media" as
requirements; neither exists on the page today. Separately,
`src/components/ui/tabs.tsx` is fully built and styled but has zero import
sites anywhere in the app — an unfinished piece of the redesign.

- [x] Add a per-title Activity section (new `getActivityForMedia` query in
      `activity/queries.ts`, rendered with the existing `ActivityItem`).
- [x] Add a Related media rail (`getRelatedLibraryItems` in
      `library/queries.ts`: same media type from the user's own library,
      ranked by number of shared genre tags, falling back to same-type-only
      when the title has no genres).
- [x] Reorganize the page into `Tabs` ("Overview", "Activity", "Related") so
      `Tabs` stops being dead code — Overview keeps the description/status/
      lists cards, Activity and Related get their own tab each.

### 5. Missing loading states on four routes (quick-medium)

`activity`, `discover`, `goals`, `library`, `lists`, `lists/[id]`, the
dashboard root, and `media/[id]` all have a `loading.tsx`; `stats`,
`tonight`, `profile`, and `u/[handle]` don't, despite each running async DB
queries against a fully known layout. Users hit a blank/frozen transition on
exactly these four routes while every sibling route animates in smoothly.

- [x] Add `loading.tsx` (skeleton, matching the existing pattern in
      `src/components/layout/skeletons.tsx`) for `stats`, `tonight`,
      `profile`, and `u/[handle]`.

### 6. Home page is missing its documented "Personalized discovery" section (medium — scoping needed)

`docs/UX.md` lists Personalized discovery as a Home priority alongside
Continue/Queue/Recently completed/Recent activity/Favorites;
`src/app/(app)/page.tsx` implements the first five, not this one.

Proposed MVP scope (confirm before building): a "For you" rail surfacing a
handful of the user's own `want`-status backlog items that share a genre
with something they've rated highly or marked a favorite — no external
recommendation API, just a smarter slice of data already in the user's
library. Simplest thing that could be called "personalized" without a new
data source.

- [x] Built as scoped above: `getDashboardSections` now returns a `discovery`
      list (genre-affinity backlog picks via `rankBacklog`'s existing
      `hasGenreMatch` flag, excluding anything already in Queue so the two
      rails don't overlap), rendered as a "For you" section on the dashboard.
      `MediaCard` gained an optional `reason` caption (already used by Tonight)
      to show why each pick was surfaced.

### 7. `Sheet` component is unused — use it for mobile Library filters (medium)

`docs/UX.md`'s Mobile section calls for "Bottom sheets where useful."
`src/components/ui/sheet.tsx` is glass-ready and fully styled but has zero
import sites. Library's filter bar (`library-filters.tsx`) is always
visible and takes fixed vertical space on mobile even though most visits
don't touch it.

- [x] On small screens, collapse Library's media-type/status/sort controls
      behind a "Filters" trigger button that opens them in a `Sheet` (search
      input stays visible outside the sheet, since it's the highest-use
      control). Grid/list toggle stays inline next to the trigger.
      While testing this, found and fixed a real (pre-existing, unrelated to
      the Sheet work) race condition in the search debounce: the debounced
      `router.replace` closed over a stale `searchParams` snapshot, so
      picking a sort/type/status filter within ~300ms of typing in search
      could get silently reverted when the debounce fired. Fixed by reading
      current params from a ref at fire-time instead of the closure.

### 8. Settings page is a stub behind a permanent nav item (flagged, not part of this pass)

`src/app/(app)/settings/page.tsx` is linked from both desktop nav and
Profile, but only renders a `PlaceholderScreen` ("Account, profile, and
privacy preferences will live here"). Building real account/privacy
settings is a feature project on its own (forms, validation, likely new DB
fields), not a polish-pass fix.

- [ ] Not building this now. Revisit as its own effort — either flesh it out
      or remove it from nav until there's something behind it.

## Status

Items 1–7 are done (typecheck and lint pass on the full diff). Only item 8
remains, and it's explicitly deferred out of this pass — so there's nothing
left to build here. Delete this file once it's merged.
