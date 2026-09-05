import "@testing-library/jest-dom/vitest";

// Unit tests should never need a live DB or real secrets — just enough for
// src/lib/env.ts to parse successfully when a module transitively imports it.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.AUTH_SECRET ??= "test-secret";
