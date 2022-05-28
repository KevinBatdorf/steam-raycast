import { Action, ActionPanel, List, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import { cacheProvider } from "./lib/cache";
import { isFakeData } from "./lib/fake";
import { useGamesSearch, useMyGames, useRecentlyPlayedGames } from "./lib/fetcher";
import { MyGamesListType, DynamicGameListItem } from "./components/ListItems";
import { MyGames } from "./components/MyGames";
import { Search, SearchList } from "./components/Search";
import { DefaultActions } from "./components/Actions";
import { useIsLoggedIn } from "./lib/hooks";
import { GameDataSimple } from "./types";

export default function Command() {
  return (
    <SWRConfig value={{ provider: isFakeData ? undefined : cacheProvider }}>
      <App />
    </SWRConfig>
  );
}

const App = () => {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(0);
  const { data: recentlyPlayed } = useRecentlyPlayedGames();
  const { data: searchedGames } = useGamesSearch({ term: search, ready: search.length > 0 });
  const [recentlyViewed, setRecentlyViewed] = useState<GameDataSimple[]>();
  const isLoggedIn = useIsLoggedIn();
  const { data: myGames } = useMyGames();

  useEffect(() => {
    // LocalStorage.clear();
    LocalStorage.getItem("recently-viewed").then((gameDataRaw) => {
      if (!gameDataRaw) return;
      const games = JSON.parse(String(gameDataRaw));
      setRecentlyViewed(games ?? []);
    });
  }, []);

  return (
    <List
      isLoading={Boolean(search) || typeof isLoggedIn === "undefined"}
      onSearchTextChange={setSearch}
      onSelectionChange={(id) => setHovered(Number(id ?? 0))}
      throttle
      searchBarPlaceholder="Search for a game by title..."
    >
      {search ? (
        <SearchList searchedGames={searchedGames} hovered={hovered} />
      ) : (
        <>
          {isLoggedIn && (
            <List.Item
              title="My Games"
              icon={{ source: "command-icon.png" }}
              actions={
                <ActionPanel>
                  <Action.Push title="View My Games" target={<MyGames />} />
                  <DefaultActions />
                </ActionPanel>
              }
            />
          )}
          {isLoggedIn && (
            <List.Item
              title="Search Steam Games"
              icon={{ source: "command-icon.png" }}
              actions={
                <ActionPanel>
                  <Action.Push title="Search Games" target={<Search />} />
                  <DefaultActions />
                </ActionPanel>
              }
            />
          )}
          {recentlyViewed && recentlyViewed?.length > 0 ? (
            <List.Section title="Recently Viewed Games">
              {recentlyViewed?.map((game) => (
                <DynamicGameListItem key={game.appid} game={game} ready={true} myGames={myGames} />
              ))}
            </List.Section>
          ) : null}
          {recentlyPlayed && recentlyPlayed?.length > 0 ? (
            <List.Section title="Recently Played Games">
              {recentlyPlayed?.slice(0, 5).map((game) => (
                <MyGamesListType key={game.appid} game={game} />
              ))}
            </List.Section>
          ) : null}
        </>
      )}
    </List>
  );
};
