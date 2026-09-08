import { z } from "zod";

/**
 * Server-side environment variables.
 * Add secrets and server-only config here as they're introduced
 * (DATABASE_URL, AUTH_SECRET, provider API keys, etc.).
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.url(),
  AUTH_SECRET: z.string().min(1),
  /** Both must be set together to enable Google sign-in; omit both to run credentials-only. */
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  /** Media provider API keys. Omit any of these to leave that provider unconfigured. */
  TMDB_API_KEY: z.string().min(1).optional(),
  /** Both must be set together to enable IGDB game search (Twitch developer app credentials). */
  IGDB_CLIENT_ID: z.string().min(1).optional(),
  IGDB_CLIENT_SECRET: z.string().min(1).optional(),
  COMICVINE_API_KEY: z.string().min(1).optional(),
  /** Google Books works unauthenticated; setting this only raises the rate limit. */
  GOOGLE_BOOKS_API_KEY: z.string().min(1).optional(),
  /** Forces MediaSearchService to use deterministic fixture data instead of calling real provider APIs (used in tests). */
  MEDIA_PROVIDER_MODE: z.enum(["live", "fixture"]).optional(),
});

/**
 * Client-exposed environment variables. Must be prefixed with
 * NEXT_PUBLIC_ and contain no secrets.
 */
const clientSchema = z.object({});

function parseEnv() {
  const parsedServer = serverSchema.safeParse(process.env);

  if (!parsedServer.success) {
    console.error(
      "Invalid environment variables:",
      parsedServer.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  const parsedClient = clientSchema.safeParse(process.env);

  if (!parsedClient.success) {
    console.error(
      "Invalid public environment variables:",
      parsedClient.error.flatten().fieldErrors,
    );
    throw new Error("Invalid public environment variables");
  }

  return { ...parsedServer.data, ...parsedClient.data };
}

export const env = parseEnv();
