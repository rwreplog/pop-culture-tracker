# Geekery — AI Development Guide

## Project Overview

Geekery is a personal media management application for tracking, organizing, discovering, and reflecting on entertainment and culture.

Initial media types:

- Movies
- TV shows
- Video games
- Books
- Comics

Long-term possibilities include manga, anime, music, podcasts, audiobooks, and board games.

The long-term product goal is to help users answer:

- What have I experienced?
- What do I want to experience?
- What should I experience next?

## Core Principles

1. User first — every feature should solve a real problem.
2. Simple by default — common actions should be fast.
3. Extensible architecture — new media types should not require a rewrite.
4. Mobile first — excellent phone experience and strong desktop experience.
5. Accessible by default.
6. Private by default.
7. Quality over speed.
8. Avoid unnecessary complexity and dependencies.

## Technology Direction

Unless an Architecture Decision Record changes this:

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
- ESLint
- Prettier

Use current stable versions when initializing the project.

## Agent Responsibilities

- Product: vision, requirements, scope, prioritization.
- Architecture: system boundaries, technical decisions, scalability.
- UX: workflows, navigation, information architecture, responsive behavior.
- Frontend: React/Next.js UI, accessibility, responsive implementation.
- Backend: server actions, APIs, business logic, authorization.
- Database: schema, relations, indexes, migrations, integrity.
- Integrations: external media APIs, adapters, caching, rate limits.
- Testing: unit, integration, and end-to-end strategy.
- Security: authentication, authorization, validation, secrets, threat review.
- DevOps: CI/CD, environments, deployment, observability.
- Code Review: final correctness, architecture, security, testing, maintainability.

## Agent Workflow

Before implementing a significant feature:

1. Read this file.
2. Read relevant files under `/docs`.
3. Read the relevant agent instructions under `/agents`.
4. Identify conflicts or missing decisions.
5. Make architectural decisions deliberately and document them.
6. Implement the smallest complete solution.
7. Add/update tests.
8. Review the implementation.
9. Update documentation when behavior or architecture changes.

## Source of Truth

When documents conflict, use:

1. Explicit user requirement
2. Product requirements
3. Architecture decisions
4. Data model
5. UX specification
6. Agent-specific guidance
7. Existing implementation

Do not silently change documented behavior.

## Implementation Rules

- Prefer existing components over duplicates.
- Keep business logic out of presentation components.
- Validate all external/user input.
- Never trust client-side authorization.
- Never expose secrets.
- Avoid premature optimization.
- Avoid unnecessary dependencies.
- Keep database migrations in source control.
- Test meaningful business logic.
- Keep unrelated changes out of feature work.

## Versioning

The app version lives in `package.json`'s `version` field, surfaced to
users on the Settings page via `NEXT_PUBLIC_APP_VERSION` (wired up in
`next.config.ts`). Bump it as part of finishing any PR with a
user-visible effect — don't wait to be asked:

- Patch (`0.5.1` → `0.5.2`): bug fixes, UI/UX tweaks, copy changes, and
  other small user-visible changes.
- Minor (`0.5.x` → `0.6.0`): a new feature, a removed feature, or a PR
  that bundles several patch-worthy changes together.
- Skip the bump for changes with no user-visible effect: refactors,
  test-only changes, docs, CI/tooling.
- The major version stays `0` pre-1.0 — crossing to `1.0.0` is a
  deliberate product decision, not an automatic bump.
- If a PR's scope is genuinely borderline between patch and minor, ask
  rather than guess.

Mechanics (matching existing history — see `git log -- package.json`):
bump only `package.json`'s `version` field and leave `package-lock.json`
alone, as its own commit (not folded into the feature/fix commit) on the
same branch/PR, with the commit message `Bump version to X.Y.Z`.

## MVP

The MVP includes:

- Authentication
- User profile
- Media search
- Add/remove library items
- Status
- Ratings
- Favorites
- Notes
- Progress
- Custom lists
- Dashboard
- Basic activity history

Defer social networking, advanced AI recommendations, and elaborate gamification.

## Product Philosophy

Tracking should feel helpful, not like homework. Users should be able to record as much or as little detail as they want.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
