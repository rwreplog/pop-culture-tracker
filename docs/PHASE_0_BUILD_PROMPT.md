# Phase 0 Build Prompt

Use this prompt with the coding agent after placing the repository documents into the project.

---

You are building the foundation for a new application called **Geekery**.

Before writing code, read:

- `/AGENTS.md`
- `/docs/PRODUCT.md`
- `/docs/REQUIREMENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/DATA_MODEL.md`
- `/docs/UX.md`
- `/docs/DESIGN_SYSTEM.md`
- `/docs/SECURITY.md`
- `/docs/TESTING.md`
- `/docs/INTEGRATIONS.md`
- `/docs/ROADMAP.md`
- Relevant files under `/agents`

## Objective

Initialize a production-quality Next.js application that provides the foundation for the MVP.

**Do not implement the entire product yet.**

The goal of Phase 0 is a clean, working foundation that future agents can safely build upon.

## Technology

Use:

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

Use current stable versions.

## Phase 0 Deliverables

### 1. Application Initialization

Create the Next.js application using the App Router.

Configure:

- TypeScript
- ESLint
- Prettier
- Tailwind
- Path aliases
- Environment variable validation

### 2. Application Shell

Create:

- Responsive root layout
- Desktop navigation
- Mobile navigation
- Header
- Main content area
- Theme support
- Basic design tokens

Do not build detailed dashboard functionality yet.

### 3. UI Foundation

Configure shadcn/ui.

Create only foundational components needed for the shell.

Do not generate a huge component library.

### 4. Database

Configure Drizzle for PostgreSQL.

Create the initial schema for:

- User integration required by Auth.js
- Media
- MediaExternalId
- LibraryItem
- List
- ListItem
- Activity

Implement appropriate:

- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Timestamps

Do not over-model future features.

### 5. Authentication

Configure Auth.js with an architecture that can support additional providers later.

At minimum, establish:

- Authentication configuration
- Session handling
- Protected application area
- Sign-in/sign-out flow

Do not build elaborate account management yet.

### 6. Service Architecture

Create initial service boundaries:

```text
src/lib/services/
  media/
  library/
  lists/
  activity/
```

The services can initially be minimal, but establish clear boundaries.

### 7. Validation

Establish a validation pattern using Zod.

Create a clear location for schemas.

### 8. Testing

Configure:

- Vitest
- Playwright

Add at least:

- One meaningful unit test
- One database/service-oriented test if practical
- One Playwright smoke test

### 9. Quality Tooling

Ensure these commands work:

```text
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

If the chosen package manager differs, provide equivalent commands.

### 10. CI

Create a GitHub Actions workflow that validates:

- Install
- Lint
- TypeScript
- Unit tests
- Build

Add E2E testing when the CI environment can support it reliably.

## Important Constraints

Do not:

- Build social features
- Build recommendations
- Build AI features
- Build elaborate statistics
- Build gamification
- Create microservices
- Add unnecessary state-management libraries
- Add unnecessary dependencies
- Hard-code provider-specific media schemas into UI
- Commit secrets
- Create fake production credentials
- Generate placeholder functionality that looks complete but is not

## Implementation Process

Work in small logical steps.

After each major step:

1. Check types.
2. Run lint.
3. Run relevant tests.
4. Fix issues before proceeding.

At the end:

1. Run all quality checks.
2. Review the architecture against `/docs/ARCHITECTURE.md`.
3. Review security against `/docs/SECURITY.md`.
4. Update documentation if implementation decisions differ from the planned architecture.
5. Summarize files created and important decisions.

## Definition of Done

Phase 0 is complete when:

- The app runs locally.
- The application shell works on desktop and mobile.
- Theme support works.
- Authentication foundation works.
- PostgreSQL/Drizzle is configured.
- Initial schema/migrations exist.
- Service boundaries exist.
- Validation is established.
- Unit/E2E testing is configured.
- Linting/type checking/build pass.
- CI configuration exists.
- No secrets are committed.
- Documentation matches the implementation.

Do not proceed into the full MVP until these foundations are stable.
