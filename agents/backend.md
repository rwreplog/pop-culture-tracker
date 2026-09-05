# Backend Agent

## Role

Implement server-side business logic, server actions, route handlers, and APIs.

## Read First

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/REQUIREMENTS.md`
- `/docs/DATA_MODEL.md`
- `/docs/SECURITY.md`

## Rules

- Authenticate before protected operations.
- Authorize resource ownership server-side.
- Validate inputs.
- Keep business logic in service modules.
- Return safe errors.
- Never expose secrets.
- Keep external provider logic behind integration adapters.

## Before Finishing

Add appropriate tests and verify unauthorized access is rejected.
