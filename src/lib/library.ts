import { getPreferenceValues } from "@raycast/api";
import { GameDataSimple } from "../types";
import { steamFetch } from "./http";

export type LibraryGame = GameDataSimple & {
  playtime_2weeks?: number;
  rtime_last_played?: number;
};

type PlayerServiceResponse = {
  response?: {
    game_count?: number;
    total_count?: number;
    games?: LibraryGame[];
  };
};

function credentials() {
  const { token, steamid } = getPreferenceValues<Preferences>();
  const key = token?.trim();
  const id = steamid?.trim();
  if (!key || !id) {
    throw new Error("Set your Web API Key and Steam ID in the Steam extension preferences to read your library.");
  }
  return { key, steamid: id };
}

async function playerService(method: "GetOwnedGames" | "GetRecentlyPlayedGames") {
  const { key, steamid } = credentials();
  const url = new URL(`https://api.steampowered.com/IPlayerService/${method}/v1/`);
  url.searchParams.set("key", key);
  url.searchParams.set("steamid", steamid);
  url.searchParams.set("include_appinfo", "1");
  url.searchParams.set("include_played_free_games", "1");
  url.searchParams.set("format", "json");

  const response = await steamFetch(url);
  if (response.status === 401 || response.status === 403) {
    throw new Error("Steam rejected the Web API Key. Check it in the Steam extension preferences.");
  }
  if (!response.ok) {
    throw new Error(`Steam could not load your library (${response.status}).`);
  }
  const body = (await response.json()) as PlayerServiceResponse;
  return {
    count: body.response?.game_count ?? body.response?.total_count,
    games: body.response?.games ?? [],
  };
}

export const getOwnedGames = () => playerService("GetOwnedGames");
export const getRecentlyPlayedGames = () => playerService("GetRecentlyPlayedGames");
