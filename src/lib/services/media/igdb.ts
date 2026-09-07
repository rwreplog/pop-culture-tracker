import { z } from "zod";

import { env } from "@/lib/env";
import {
  ProviderNotConfiguredError,
  ProviderRequestError,
  fetchProviderJson,
} from "@/lib/services/media/http";
import type {
  NormalizedMediaDetail,
  NormalizedSearchResult,
  ProviderAdapter,
} from "@/lib/services/media/provider-types";

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const API_URL = "https://api.igdb.com/v4/games";
const COVER_BASE_URL = "https://images.igdb.com/igdb/image/upload/t_cover_big";

// IGDB's query language (Apicalypse) returns nested fields in one request,
// so search and detail lookups can share the same field list and schema.
const FIELDS =
  "name,first_release_date,cover.image_id,genres.name,summary,involved_companies.company.name,involved_companies.developer";

const gameSchema = z.object({
  id: z.number(),
  name: z.string(),
  first_release_date: z.number().nullable().optional(),
  cover: z.object({ image_id: z.string() }).nullable().optional(),
  genres: z.array(z.object({ name: z.string() })).optional(),
  summary: z.string().optional(),
  involved_companies: z
    .array(
      z.object({
        company: z.object({ name: z.string() }),
        developer: z.boolean().optional(),
      }),
    )
    .optional(),
});

const gamesResponseSchema = z.array(gameSchema).catch([]);

function requireCredentials(): { clientId: string; clientSecret: string } {
  if (!env.IGDB_CLIENT_ID || !env.IGDB_CLIENT_SECRET) {
    throw new ProviderNotConfiguredError(
      "IGDB_CLIENT_ID/IGDB_CLIENT_SECRET is not configured.",
    );
  }
  return {
    clientId: env.IGDB_CLIENT_ID,
    clientSecret: env.IGDB_CLIENT_SECRET,
  };
}

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/**
 * IGDB auth rides on Twitch's OAuth client-credentials flow. Tokens are
 * valid for ~60 days, so cache in-process and only refetch near expiry.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const { clientId, clientSecret } = requireCredentials();
  const url = `${TOKEN_URL}?client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`;
  const json = await fetchProviderJson(url, { method: "POST" });
  const parsed = tokenResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new ProviderRequestError("IGDB token response was malformed.");
  }

  cachedToken = {
    accessToken: parsed.data.access_token,
    expiresAt: Date.now() + (parsed.data.expires_in - 60) * 1000,
  };
  return cachedToken.accessToken;
}

async function queryGames(body: string): Promise<z.infer<typeof gameSchema>[]> {
  const { clientId } = requireCredentials();
  const accessToken = await getAccessToken();
  const json = await fetchProviderJson(API_URL, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body,
  });
  return gamesResponseSchema.parse(json);
}

function toSearchResult(
  raw: z.infer<typeof gameSchema>,
): NormalizedSearchResult {
  return {
    provider: "igdb",
    externalId: String(raw.id),
    mediaType: "game",
    title: raw.name,
    releaseDate: raw.first_release_date
      ? new Date(raw.first_release_date * 1000).toISOString().slice(0, 10)
      : null,
    imageUrl: raw.cover?.image_id
      ? `${COVER_BASE_URL}/${raw.cover.image_id}.jpg`
      : null,
    creator:
      raw.involved_companies
        ?.filter((c) => c.developer)
        .map((c) => c.company.name)
        .join(", ") || null,
    description: raw.summary || null,
    genres: raw.genres?.map((g) => g.name) ?? [],
  };
}

export const igdbAdapter: ProviderAdapter = {
  provider: "igdb",

  async search(query) {
    const escaped = query.replace(/"/g, '\\"');
    const body = `search "${escaped}"; fields ${FIELDS}; limit 20;`;
    const games = await queryGames(body);
    return games.map(toSearchResult);
  },

  async getDetails(externalId) {
    const id = Number(externalId);
    if (!Number.isInteger(id)) return null;
    const body = `fields ${FIELDS}; where id = ${id};`;
    const games = await queryGames(body);
    const game = games[0];
    if (!game) return null;

    const detail: NormalizedMediaDetail = {
      ...toSearchResult(game),
      metadata: null,
    };
    return detail;
  },
};
