import { getSteamGameStoreUrl } from "../lib/games";
import { getOwnedGames } from "../lib/library";
import { formatPlaytimeHours, formatSteamTimestamp } from "../lib/users";

type Input = {
  /**
   * Optional text to filter the user's games by title, for example "stardew". Leave empty to list the whole library.
   */
  query?: string;
  /**
   * Order of the games: "playtime" (most played first), "recent" (most recently played first), or "name". Defaults to "playtime".
   */
  sortBy?: "playtime" | "recent" | "name";
  /**
   * Maximum number of games to return. Defaults to 25, at most 100.
   */
  maxResults?: number;
};

/**
 * List the games the user owns on Steam, with total playtime and when each was last played.
 * Use this when the user asks what games they own, how long they have played a game, or which of their games they have never played.
 */
export default async function getOwnedGamesTool(input: Input) {
  const { count, games } = await getOwnedGames();
  const query = input.query?.trim().toLowerCase();
  const maxResults = Math.min(Math.max(input.maxResults ?? 25, 1), 100);
  const sortBy = input.sortBy ?? "playtime";

  const matched = games
    .filter((game) => !query || game.name?.toLowerCase().includes(query))
    .sort((a, b) => {
      if (sortBy === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      if (sortBy === "recent") return (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0);
      return b.playtime_forever - a.playtime_forever;
    });

  return {
    totalOwned: count ?? games.length,
    matched: matched.length,
    games: matched.slice(0, maxResults).map((game) => ({
      appid: game.appid,
      name: game.name,
      playtime: formatPlaytimeHours(game.playtime_forever) ?? "never played",
      playtimeMinutes: game.playtime_forever,
      lastPlayed: formatSteamTimestamp(game.rtime_last_played),
      storeUrl: getSteamGameStoreUrl(game.appid),
    })),
    warnings: games.length
      ? []
      : ["Steam returned no games. The profile's game details may be private, or the library is empty."],
  };
}
