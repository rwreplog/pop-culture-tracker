# Architecture

## Initial Architecture

```text
Browser
   |
   v
Next.js Application
   |
   +-- UI
   +-- Server Components
   +-- Server Actions
   +-- Route Handlers
   |
   v
Application Services
   |
   +-- Library
   +-- Lists
   +-- Activity
   +-- Media Search
   +-- Recommendations (future)
   |
   +----------------+
   v                v
PostgreSQL       External APIs
```

Start as a modular monolith. Do not introduce microservices without a concrete requirement.

## Frontend

- React
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

Prefer server rendering where appropriate. Use client components only when interaction requires them.

## Backend

Keep business logic out of UI components.

Prefer service modules such as:

```text
src/lib/services/
  library/
  lists/
  media/
  activity/
```

## Validation

Use Zod or an equivalent schema validator at application boundaries.

Validate:

- Forms
- Server actions
- API requests
- External API responses where appropriate

## Authorization

Server-side flow:

Authenticate → Identify User → Authorize Resource → Execute Operation

## Database

PostgreSQL with Drizzle ORM.

Migrations belong in source control.

## External APIs

Isolate providers behind adapters:

UI → MediaSearchService → ProviderAdapter → External API

The UI should never depend directly on provider-specific response shapes.

## Caching

Cache external metadata where appropriate. Avoid cross-user data leakage.

## Errors

Production errors should be safe for users and useful for developers. Never expose secrets or internal stack traces.

## Configuration

Use environment variables for secrets and environment-specific configuration.

## Observability

Plan for structured logging, error monitoring, performance monitoring, and external API monitoring.
