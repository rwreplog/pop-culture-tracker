/** A provider adapter is missing required API key configuration. */
export class ProviderNotConfiguredError extends Error {}

/** A provider's API request failed (network error or non-2xx response). */
export class ProviderRequestError extends Error {}

/**
 * Fetches and parses JSON from a provider API, normalizing network/HTTP
 * failures into ProviderRequestError so callers have one error type to
 * handle. Applies a timeout since external APIs are outside our control.
 */
export async function fetchProviderJson(
  url: string,
  init?: RequestInit,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  } catch (error) {
    throw new ProviderRequestError(
      `Network error calling provider: ${(error as Error).message}`,
    );
  }

  if (!response.ok) {
    throw new ProviderRequestError(
      `Provider responded with status ${response.status}`,
    );
  }

  return response.json();
}
