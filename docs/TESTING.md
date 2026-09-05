# Testing Strategy

## Goals

Tests should provide confidence without making development unnecessarily slow.

## Unit Tests

Use Vitest for:

- Pure business logic
- Validation
- Status transitions
- Rating logic
- Progress calculations
- Utility functions

## Integration Tests

Test:

- Database interactions
- Service boundaries
- Authorization behavior
- Media provider adapters

## End-to-End

Use Playwright for critical journeys:

- Registration/login
- Search media
- Add to library
- Change status
- Rate item
- Create list
- Add item to list
- Dashboard behavior

## Test Principles

- Test behavior, not implementation details.
- Include authorization tests for user-owned resources.
- Include error paths.
- Avoid brittle selectors.
- Prefer accessible roles and labels.
- Keep fixtures deterministic.
