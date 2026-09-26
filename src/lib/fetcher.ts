import { getPreferenceValues, LocalStorage, openCommandPreferences } from "@raycast/api";
import { showFailureToast, useCachedPromise, usePromise } from "@raycast/utils";
import { useState } from "react";
import { fakeGameData, fakeGameDataSimpleMany, fakeGames, isFakeData } from "./fake";
import { GameData, GameDataSimple, GameDataSimpleResponse } from "../types";
import { fetchSteamGames, getSteamGameData, getSteamGameSearchUrl, searchSteamGameHits, SteamGameHit } from "./games";
import { steamFetch } from "./http";

async function fetcherWithAuth(url: string) {
  const { token, steamid } = getPreferenceValues<Preferences>();
  if (!token || !steamid) return [];
  const response = await steamFetch(url + `&key=${token.trim()}&steamid=${steamid.trim()}`);
  if (response.status === 403) {
    // If the request fails to auth, stash it to check if they later updated it
    await LocalStorage.setItem("API_KEY_ERROR", token.trim() + steamid.trim());
    showFailureToast(new Error("Please check your API key."), {
      title: "403 Error",
      primaryAction: {
        title: "Open preferences",
        onAction: () => {
          openCommandPreferences();
        },
      },
    });
  }
  if (!response.ok) {
    return [];
  }
  await LocalStorage.removeItem("API_KEY_ERROR");
  const gamesResponse = (await response.json()) as GameDataSimpleResponse;
  return gamesResponse?.response?.games ?? [];
}

const fakeSearch = async () => fakeGames(30) as SteamGameHit[];

export const useGamesSearch = ({ term = "", execute = true }) => {
  const { data, isLoading, error } = useCachedPromise(isFakeData ? fakeSearch : searchSteamGameHits, [term], {
    execute: execute && term.length > 0,
    keepPreviousData: true,
  });
  return { data, isLoading, isError: error };
};

export const useRandomGames = () => {
  const [cacheKey] = useState(() => Math.floor(Math.random() * 10000) + 1);
  const { data, isLoading } = usePromise(
    isFakeData ? fakeSearch : (key: number) => fetchSteamGames(getSteamGameSearchUrl("", key)),
    [cacheKey],
  );
  return { data, isLoading };
};

// Callers render their own not-found and error states, so the hook's failure toast would double them
const silent = () => undefined;

export const useGameData = ({ appid = 0, execute = true }) => {
  const { data, isLoading, error } = useCachedPromise(
    isFakeData ? async () => fakeGameData(30) : getSteamGameData,
    [appid],
    { execute: execute && appid > 0, onError: silent },
  );
  return { data: data as GameData | undefined, isLoading, isError: error };
};

export const useRecentlyPlayedGames = () => useGetOwnedGames("GetRecentlyPlayedGames");
export const useMyGames = () => useGetOwnedGames("GetOwnedGames");
const useGetOwnedGames = (type: string) => {
  const { data, isLoading, error } = useCachedPromise(
    isFakeData ? async () => fakeGameDataSimpleMany(30) : fetcherWithAuth,
    [`https://api.steampowered.com/IPlayerService/${type}/v1/?format=json&include_appinfo=1`],
  );
  return { data: data as GameDataSimple[] | undefined, isLoading, isError: error };
};
