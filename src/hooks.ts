import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import useSWR from "swr";
import { fakeGames, isFakeData } from "./fake";
import { GameData, GameDataResponse, GameSimple } from "./types";

async function fetchGames(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const games = (await response.json()) as GameSimple[];
  return games?.filter((game) => game?.appid) ?? [];
}

async function fetchGameData({ appid, url }: { appid: number; url: string }) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const gameData = (await response.json()) as GameDataResponse;
  if (!gameData?.[appid]?.success) {
    throw new Error(`${appid} not found`);
  }
  return gameData?.[appid]?.data;
}

// async function fetcherWithAuth<T>(url: string) {
//   const { token } = getPreferenceValues();
//   const response = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}`, ContentType: "application/json" },
//   });
//   if (!response.ok) {
//     throw new Error(`${response.status} ${response.statusText}`);
//   }
//   const games = (await response.json()) as GameSimple[];
//   return games?.filter((game) => game?.appid) ?? [];
// }

export const useGamesSearch = ({ term = "", cacheKey = 0 }) => {
  const { data, error, isValidating } = useSWR<GameSimple[]>(
    `https://steam-search.vercel.app/api/games?cacheKey=${cacheKey}&search=${term}`,
    isFakeData ? () => fakeGames(15) : fetchGames
  );

  return {
    data,
    isLoading: !data && !error,
    isValidating,
    isError: error,
  };
};
export const useGameData = (appid: number) => {
  const { data, error, isValidating } = useSWR<GameData>(
    {
      appid,
      url: `https://store.steampowered.com/api/appdetails?appids=${appid}`,
    },
    fetchGameData
  );

  return {
    data,
    isLoading: !data && !error,
    isValidating,
    isError: error,
  };
};
