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
