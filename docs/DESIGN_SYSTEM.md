# Design System — Geekery Premium UI

_Revised for the v0.3 "cinematic glass" redesign. Supersedes the previous, more
conservative direction below where the two disagree._

## Direction

Premium personal media application with enterprise-grade product quality —
bold and cutting-edge rather than restrained.

Qualities:

- Cinematic, immersive, editorial
- Bold typography, confident hierarchy
- Premium mobile-app feel, not a corporate dashboard
- Personal
- Information-rich without clutter

Avoid:

- Generic SaaS card grids
- Dense tables as the default presentation
- Childish gamification
- Excessive animation
- Visual noise
- Gradients/glow used as decoration everywhere rather than a deliberate accent
  (see "Color & Glow" — the glow language is bold but single-hue and
  purposeful, not painted onto every surface)

## Visual Language

Geekery should borrow the strengths of premium entertainment products: immersive imagery, strong hierarchy, personalized rails, contextual metadata, and purposeful motion. It should improve on the typical streaming UI by giving the user richer ownership, organization, history, and insight.

Dark mode is the primary, flagship experience — the cinematic glass/glow
language (below) is designed for it and is deliberately subtler in light
mode. Light mode must stay fully usable and on-brand, but dark mode is where
the redesign is meant to be seen.

## Color & Glow

One brand hue only: blue, ~264° (`--primary` / `--accent-2`). Never introduce
a second accent hue (no pink, purple, or violet) — glow and gradients stay
strictly single-hue, varying only lightness/chroma for depth (see
`--accent-2` in `globals.css`).

- **Glass surfaces**: `Card` and `Dialog`/`Sheet` get a `variant="glass"` (or
  built-in dark-mode) treatment — translucent, blurred, softly bordered — for
  hero and flagship surfaces (auth cards, stat tiles, the mobile nav dock).
  Not every card needs to be glass; use it for surfaces that should feel
  elevated/floating.
- **Glow**: reserved for primary actions and active/selected states (the
  default button, the active nav item, chart bars, progress fills) — a
  shadow or gradient tinted with `--primary`/`--accent-2`, never applied to
  incidental UI.
- **Shape**: buttons and badges are fully rounded (pill/circle) site-wide;
  cards and dialogs use a generous, consistent radius scale (`--radius` and
  its derived tokens in `globals.css`); text inputs stay moderately rounded,
  not full pill.

## Theme

Support light and dark modes using semantic design tokens.

## Typography

Two-font pairing, both via `next/font/google`:

- **Display / headings** (`--font-heading`, Bricolage Grotesque): page
  titles, section headings (`h1`/`h2` pick this up automatically via the
  base layer), hero numerals/stats.
- **Body / UI** (`--font-sans`, Space Grotesk): everything else — body text,
  controls, captions, numerals in dense contexts (`--font-mono` also maps to
  it for tabular numbers).

Clear weight/size hierarchy:

- Display
- Page heading
- Section heading
- Card title
- Body
- Metadata
- Caption

## Media Cards

Consistently support:

- Artwork
- Title
- Media type
- Optional year
- Optional status
- Optional rating
- Hover/focus states
- Missing artwork state

## Status

Status must communicate through text/icon plus visual styling, not color alone.

## Forms

Use explicit labels, useful validation, clear errors, and mobile-friendly controls.

## Motion & Interaction

Use motion for state change, navigation, expansion, and loading. Respect `prefers-reduced-motion`.

## Responsive

Design around content needs rather than device-specific assumptions. Desktop should feel expansive and cinematic; mobile should feel focused and thumb-friendly. The experience must remain equally premium at both sizes.
