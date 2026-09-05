# Functional Requirements

## Authentication

Users can:

- Register
- Sign in
- Sign out
- Reset credentials
- Manage their account

All private data must be scoped to the authenticated user.

## Profile

Users can:

- Set display name
- Set avatar
- Configure preferences
- Configure privacy settings

## Media Search

Users can search supported external media providers.

Search results should expose, when available:

- Title
- Media type
- Release/publication date
- Artwork
- Creator/developer/director/author

## Library

Users can:

- Add media
- Remove media
- Change status
- Rate media
- Favorite media
- Add notes
- Track progress
- View history

A user should not have duplicate library entries for the same canonical media entity.

## Progress

Progress must be media-type aware and optional.

Examples:

- TV: season/episode
- Book: page/percentage
- Game: percentage or custom progress
- Comic: issue/volume

## Lists

Users can:

- Create
- Rename
- Delete
- Add items
- Remove items
- Reorder items

## Activity

Record meaningful events such as:

- Added media
- Started media
- Completed media
- Rated media
- Added to list
- Updated progress

## Dashboard

Display:

- Current media
- Recently completed
- Queue/backlog
- Favorites
- Recent activity

## Responsive

Support phones, tablets, laptops, and desktop monitors.

## Accessibility

Support:

- Keyboard navigation
- Semantic HTML
- Accessible labels
- Appropriate contrast
- Visible focus
- Screen readers
- Reduced motion
- No color-only status communication

## Performance

Prioritize:

- Fast initial load
- Efficient queries
- Optimized images
- Pagination
- Lazy loading where appropriate
- External metadata caching

## Security

- Verify authorization server-side.
- Never trust client-provided ownership.
- Never expose API secrets to the browser.
