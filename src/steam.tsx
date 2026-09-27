import { Action, ActionPanel, Icon, List, LocalStorage, environment, openExtensionPreferences } from "@raycast/api";
import { rm } from "fs/promises";
import { join } from "path";
import { useEffect, useState } from "react";
import { useGamesSearch, useMyGames, useRecentlyPlayedGames } from "./lib/fetcher";
import { appidFromItemId } from "./lib/util";
import { MyGamesListType, DynamicGameListItem } from "./components/ListItems";
import { MyGames } from "./components/MyGames";
import { Search, SearchList } from "./components/Search";
import { DefaultActions } from "./components/Actions";
import { useIsLoggedIn, useShowingDetail } from "./lib/hooks";
import { GameDataSimple } from "./types";

export default function Command() {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(0);
  const isLoggedIn = useIsLoggedIn();
  const { data: recentlyPlayed, isLoading: recentlyPlayedLoading } = useRecentlyPlayedGames();
  const { showingDetail, toggleDetail } = useShowingDetail();
  const {
    data: searchedGames,
    isLoading: searchLoading,
    isError: searchError,
  } = useGamesSearch({
    term: search,
    execute: search.length > 0,
  });
  const [recentlyViewed, setRecentlyViewed] = useState<GameDataSimple[]>();
  const { data: myGames, isLoading: myGamesLoading } = useMyGames();

  useEffect(() => {
    // Older versions kept an SWR cache here that nothing reads any more
    rm(join(environment.supportPath, "swr-cache"), { force: true }).catch(() => undefined);
  }, []);

  useEffect(() => {
    LocalStorage.getItem("recently-viewed").then((gameDataRaw) => {
      if (!gameDataRaw) return;
      const games = JSON.parse(String(gameDataRaw));
      setRecentlyViewed(games ?? []);
    });
  }, []);

  const loading = () => {
    if (search) {
      return searchLoading;
    }
    if (isLoggedIn) {
      return myGamesLoading || recentlyPlayedLoading;
    }
    // If not logged in, we don't need to wait for data
    return false;
  };

  return (
    <List
      isLoading={loading()}
      isShowingDetail={showingDetail && Boolean(search) && Boolean(searchedGames?.length)}
      onSearchTextChange={setSearch}
      onSelectionChange={(id) => setHovered(appidFromItemId(id))}
      throttle
      searchBarPlaceholder="Search for a game by title..."
    >
      {search ? (
        <SearchList
          search={search}
          searchedGames={searchedGames}
          isLoading={searchLoading}
          error={searchError}
          hovered={hovered}
          showingDetail={showingDetail}
          onToggleDetail={toggleDetail}
        />
      ) : (
        <>
          {!isLoggedIn && !recentlyViewed?.length ? (
            <List.EmptyView
              icon={Icon.GameController}
              title="Search Steam Games"
              description="Type a game title to search. Add your Web API Key and Steam ID in the preferences to see your own games."
              actions={
                <ActionPanel>
                  <Action icon={Icon.Gear} title="Open Extension Preferences" onAction={openExtensionPreferences} />
                </ActionPanel>
              }
            />
          ) : null}
          {isLoggedIn ? (
            <List.Item
              title="My Games"
              icon={{ source: "command-icon.png" }}
              actions={
                <ActionPanel>
                  <Action.Push icon={Icon.List} title="View My Games" target={<MyGames />} />
                  <DefaultActions />
                </ActionPanel>
              }
            />
          ) : null}
          {isLoggedIn ? (
            <List.Item
              title="Search Steam Games"
              icon={{ source: "command-icon.png" }}
              actions={
                <ActionPanel>
                  <Action.Push icon={Icon.Binoculars} title="Search Steam Games" target={<Search />} />
                  <DefaultActions />
                </ActionPanel>
              }
            />
          ) : null}
          {recentlyViewed && recentlyViewed?.length > 0 ? (
            <List.Section title="Recently Viewed Games">
              {recentlyViewed?.map((game) => (
                <DynamicGameListItem
                  context="recently-viewed"
                  key={game.appid}
                  game={game}
                  ready={true}
                  myGames={myGames}
                />
              ))}
            </List.Section>
          ) : null}
          {recentlyPlayed && recentlyPlayed?.length > 0 ? (
            <List.Section title="Recently Played Games">
              {recentlyPlayed?.slice(0, 5)?.map((game) => (
                <MyGamesListType key={game.appid} game={game} />
              ))}
            </List.Section>
          ) : null}
        </>
      )}
    </List>
  );
}
