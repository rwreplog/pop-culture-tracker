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
- displayName
- avatarUrl
- createdAt
- updatedAt

### Media

- id
- mediaType
- title
- description
- releaseDate
- imageUrl
- metadata
- createdAt
- updatedAt

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

## Privacy

User data is private by default.
