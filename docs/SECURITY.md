# Security

## Principles

Security is part of feature development, not a final phase.

## Authentication

Use a maintained authentication solution.

Never implement custom password storage.

## Authorization

Every user-owned resource must be authorized server-side.

Never accept a client-provided user ID as proof of ownership.

## Input Validation

Validate:

- User input
- API payloads
- URL parameters
- Form submissions
- External provider responses where appropriate

## Secrets

Never commit:

- API keys
- Database credentials
- Auth secrets
- Tokens

Never expose server secrets to client bundles.

## Database

Use parameterized ORM queries.

Review authorization when adding new queries.

## External APIs

Protect API credentials and implement appropriate rate limiting/caching.

## Logging

Do not log:

- Passwords
- Tokens
- Session secrets
- Sensitive personal data

## Future Security Work

- Threat modeling
- Dependency scanning
- Content Security Policy
- Rate limiting
- Account abuse prevention
- Security headers
