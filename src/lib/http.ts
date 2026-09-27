import { captureException } from "@raycast/api";

// Web API URLs carry the user's key and Steam ID, so reports name the endpoint only
const endpoint = (url: string | URL) => {
  const { origin, pathname } = new URL(url);
  return origin + pathname;
};

export class SteamNetworkError extends Error {}

export async function steamFetch(url: string | URL, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    captureException(new Error(`${message}: ${endpoint(url)}`));
    throw new SteamNetworkError(message);
  }
  if (response.status >= 500) {
    const status = [response.status, response.statusText].filter(Boolean).join(" ");
    captureException(new Error(`${status}: ${endpoint(url)}`));
  }
  return response;
}
