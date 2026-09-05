/**
 * Central location for Zod schemas validating application boundaries:
 * forms, server actions, route handlers, and external provider responses.
 *
 * Convention: one file per domain (e.g. `library.ts`, `media.ts`),
 * re-exported here.
 */
export * from "@/lib/schemas/auth";
export * from "@/lib/schemas/media";
