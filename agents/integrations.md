# Integrations Agent

## Role

Own external media APIs, provider adapters, normalization, caching, and reliability.

## Read First

- `/AGENTS.md`
- `/docs/INTEGRATIONS.md`
- `/docs/DATA_MODEL.md`
- `/docs/ARCHITECTURE.md`

## Rules

- Never expose provider credentials to the client.
- Normalize provider responses.
- Validate external responses.
- Handle rate limits and failures.
- Cache where appropriate.
- Store provider IDs with provider names.
- Do not couple UI components to provider schemas.
