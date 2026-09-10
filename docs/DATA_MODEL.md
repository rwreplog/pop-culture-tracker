# Data Model

## Core Principle

Separate canonical media from the user's relationship to that media.

```text
MEDIA
Zelda: Tears of the Kingdom
        |
        +-- User A → Playing → 50%
        +-- User B → Completed → 5 stars
        +-- User C → Want to Play
```

## Core Entities

### User

- id
- email
- name (Auth.js's field for what the product otherwise calls "display name")
- image (Auth.js's field for avatar URL)
- emailVerified
- createdAt
- updatedAt

Column names follow Auth.js's Drizzle adapter conventions (`name`,
`email`, `emailVerified`, `image`) rather than `displayName`/`avatarUrl`,
so authentication can adopt the adapter directly instead of a custom
field mapping.

### Media

- id
- mediaType
- title
- description
- releaseDate
- imageUrl
- metadata
- seriesId
- seriesPosition
- createdAt
- updatedAt

`seriesId` is self-referential (`Media.id`). When set, this row is one
installment of the series identified by that other `Media` row, at
`seriesPosition` within it (1, 2, 3, ...). A row is "a series" purely by
having other rows point at it via `seriesId` — the parent row is an
ordinary, user-created `Media` row (a series is never resolved from a
provider search) with no `MediaExternalId` of its own. Series membership
is canonical, not per-user, for the same reason `Media` itself is shared
across users: it's a fact about the media graph, not one user's opinion.

### MediaExternalId

- id
- mediaId
- provider
- externalId

Constraint: `(provider, externalId)` is unique.

### LibraryItem

- id
- userId
- mediaId
- status
- rating
- isFavorite
- notes
- progress
- startedAt
- completedAt
- createdAt
- updatedAt

Constraint: `(userId, mediaId)` is unique.

`rating` is a half-star scale stored as an integer 0-10 (e.g. `7` = 3.5
stars), constrained at the database level.

`progress` is stored as `jsonb` rather than a scalar column, since its
shape is media-type-aware (season/episode, page/percentage,
issue/volume — see Requirements → Progress). It is validated at the
application boundary by a Zod discriminated union keyed on the media's
`mediaType`, not by a database constraint.

### List

- id
- userId
- name
- description
- createdAt
- updatedAt

### ListItem

- id
- listId
- mediaId
- position
- createdAt

Constraint: `(listId, mediaId)` is unique.

### Activity

- id
- userId
- type
- mediaId
- metadata
- createdAt

## Future Entities

- Goal
- Friendship
- Follow
- Recommendation
- Review
- Collection
- Tag
- Genre
- Creator
- Notification
- SharedList

## Media Architecture

Prefer a canonical `Media` entity with a `mediaType` rather than separate unrelated top-level models for every media type.

If media-specific relational data becomes necessary, introduce it deliberately.

## Ownership

Every user-owned entity must have a direct or indirect relationship to the authenticated user.

## Deletion

Removing a user's library entry must not delete canonical media.

Foreign keys to `Media` (from `LibraryItem`, `ListItem`, `Activity`) use
`ON DELETE RESTRICT`: since no feature currently deletes canonical media,
this is a safety net against accidental data loss rather than a modeled
behavior. Foreign keys to `User` and to a resource's own parent (e.g.
`ListItem.listId`) use `ON DELETE CASCADE`, since that data has no
meaning once its owner is gone.

## Privacy

User data is private by default.
