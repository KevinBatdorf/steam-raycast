import {
  captureException,
  getPreferenceValues,
  LocalStorage,
  openCommandPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { showFailureToast, useCachedPromise, usePromise } from "@raycast/utils";
import { useEffect, useMemo, useState } from "react";
import { fakeGameData, fakeGameDataSimpleMany, fakeGames, isFakeData } from "./fake";
import { GameData, GameDataSimple, GameDataSimpleResponse, SteamGameHit } from "../types";
import {
  fetchCommunityApps,
  fetchSteamGames,
  getSteamGameData,
  getSteamGameSearchUrl,
  searchSteamGameHits,
} from "./games";
import { steamFetch } from "./http";
import { isIndexReady, isIndexStale, searchIndex, syncIndex } from "./search-index";

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

// Callers render their own not-found and error states, so the hook's failure toast would double them
const silent = () => undefined;

const fakeSearch = async () => fakeGames(30) as SteamGameHit[];

const safely = <T>(read: () => T, fallback: T) => {
  try {
    return read();
  } catch (error) {
    captureException(error);
    return fallback;
  }
};

const useSearchIndex = () => {
  const { token, indexRefresh } = getPreferenceValues<Preferences>();
  const key = token?.trim();
  const [ready, setReady] = useState(() => Boolean(key) && !isFakeData && safely(isIndexReady, false));

  useEffect(() => {
    if (!key || isFakeData || !safely(() => isIndexStale(Number(indexRefresh) || 1), false)) return;
    const firstBuild = !safely(isIndexReady, false);
    const toast = firstBuild
      ? showToast({ style: Toast.Style.Animated, title: "Downloading the Steam game list" })
      : undefined;
    syncIndex(key)
      .then(async () => {
        setReady(true);
        await (await toast)?.hide();
      })
      .catch(async (error: unknown) => {
        const shown = await toast;
        if (!shown) return;
        shown.style = Toast.Style.Failure;
        shown.title = "Could not download the Steam game list";
        shown.message = error instanceof Error ? error.message : undefined;
      });
  }, [key, indexRefresh]);

  return ready;
};

export const useGamesSearch = ({ term = "", execute = true }) => {
  const indexReady = useSearchIndex();
  const active = execute && term.trim().length > 0;
  const found = useMemo(
    () => (active && indexReady ? safely(() => searchIndex(term), undefined) : undefined),
    [active, indexReady, term],
  );
  // The local list lacks DLC, soundtracks and anything newer than its last sync, so misses go online
  const local = found?.length ? found : undefined;
  const remote = useCachedPromise(isFakeData ? fakeSearch : searchSteamGameHits, [term], {
    execute: active && !local,
    keepPreviousData: true,
  });
  // Local results render at once; Steam's app search only adds icons, so the order never shifts
  const icons = useCachedPromise(fetchCommunityApps, [term], {
    execute: active && Boolean(local),
    keepPreviousData: true,
    onError: silent,
  });
  const data = useMemo(() => {
    if (!local) return remote.data;
    const iconById = new Map(icons.data?.map((hit) => [hit.appid, hit.icon]));
    return local.map((hit) => ({ ...hit, icon: iconById.get(hit.appid) }));
  }, [local, remote.data, icons.data]);

  return { data, isLoading: local ? false : remote.isLoading, isError: local ? undefined : remote.error };
};

export const useRandomGames = () => {
  const [cacheKey] = useState(() => Math.floor(Math.random() * 10000) + 1);
  const { data, isLoading } = usePromise(
    isFakeData ? fakeSearch : (key: number) => fetchSteamGames(getSteamGameSearchUrl("", key)),
    [cacheKey],
  );
  return { data, isLoading };
};

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
