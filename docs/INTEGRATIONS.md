# External Integrations

## Goal

Provide reliable search and metadata ingestion while keeping provider-specific behavior out of the UI.

## Provider Adapter Pattern

```text
MediaSearchService
       |
       +-- MovieProvider
       +-- TVProvider
       +-- GameProvider
       +-- BookProvider
       +-- ComicProvider
```

Providers should normalize their responses into application-level models.

## Requirements

Adapters should:

- Handle provider errors
- Handle rate limits
- Validate responses
- Normalize fields
- Support caching
- Avoid exposing provider-specific details to UI components

## Canonical Media

External IDs should be stored in `MediaExternalId`.

Do not assume a provider ID is globally unique across providers.

## Future

Potential provider choices should be evaluated separately for:

- Coverage
- Licensing/terms
- API stability
- Rate limits
- Cost
- Image availability
- Data quality
