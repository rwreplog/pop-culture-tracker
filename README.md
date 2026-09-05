# Geekery

> Premium personal media platform

A premium personal hub for tracking everything you watch, read, play, listen to, and experience.

## Vision

Bring movies, TV, games, books, comics, and eventually other media into one personal library.

The product should help answer:

**What have I experienced?**

**What do I want to experience?**

**What should I experience next?**

## MVP

The first release focuses on:

1. Authentication
2. Media search
3. Personal library
4. Status tracking
5. Ratings and favorites
6. Notes
7. Progress
8. Custom lists
9. Dashboard
10. Activity history

## Planned Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Drizzle ORM
- Auth.js
- Zod
- Vitest
- Playwright

## Repository Structure

```text
.
├── agents/       AI specialist instructions
├── docs/         Product and technical source of truth
├── src/          Application code (unit tests colocated as *.test.ts)
├── e2e/          Playwright end-to-end tests
├── AGENTS.md     Global AI development rules
└── README.md
```

## Getting Started

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/)
running locally for Postgres (on WSL2, enable this distro under
Docker Desktop → Settings → Resources → WSL Integration).

```bash
cp .env.example .env       # defaults already match docker-compose.yml
docker compose up -d       # starts Postgres on localhost:5432
npm install
npm run db:migrate         # applies migrations from src/lib/db/migrations
npm run dev
```

Then open http://localhost:3000.

### Database

```bash
npm run db:generate   # generate a new migration after changing src/lib/db/schema
npm run db:migrate    # apply pending migrations
npm run db:studio     # browse the database in Drizzle Studio
```

### Quality checks

```bash
npm run lint
npm run typecheck
npm run test        # unit tests (Vitest)
npm run test:e2e    # end-to-end tests (Playwright; run `npx playwright install` first)
npm run build
```

This covers the tooling, application shell, and database portions of
Phase 0. Authentication is the remaining Phase 0 work — see
`docs/PHASE_0_BUILD_PROMPT.md` and `docs/ROADMAP.md`.

## Development Principles

Read `AGENTS.md` before making substantial changes.

Do not begin by generating the entire application. Build vertically in small, testable increments.
