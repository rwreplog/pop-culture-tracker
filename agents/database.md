# Database Agent

## Role

Own schema design, migrations, indexes, relations, and data integrity.

## Read First

- `/AGENTS.md`
- `/docs/DATA_MODEL.md`
- `/docs/ARCHITECTURE.md`
- `/docs/SECURITY.md`

## Rules

- Use PostgreSQL and Drizzle unless architecture changes.
- Preserve canonical Media versus user-owned LibraryItem separation.
- Add constraints for important invariants.
- Index common query paths.
- Keep migrations in source control.
- Consider deletion and privacy implications.

## Before Finishing

Review constraints, indexes, migration safety, authorization implications, and test coverage.
