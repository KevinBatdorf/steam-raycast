import { Action, ActionPanel, List } from "@raycast/api";
import { useState } from "react";
import { SWRConfig } from "swr";
import { cacheProvider } from "./lib/cache";
import { isFakeData } from "./lib/fake";
import { useGamesSearch, useMyGames, useRecentlyPlayedGames } from "./lib/fetcher";
import { MyGamesListType } from "./components/ListItems";
import { MyGames } from "./components/MyGames";
import { Search, SearchList } from "./components/Search";

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
  const { data: recentlyPlayedGames } = useRecentlyPlayedGames();
  const { data: searchedGames } = useGamesSearch({ term: search, ready: search.length > 0 });
  const { data: myGames } = useMyGames();

  return (
    <List
      isLoading={Boolean(search)}
      onSearchTextChange={setSearch}
      onSelectionChange={(id) => setHovered(Number(id ?? 0))}
      throttle
      searchBarPlaceholder="Search for a game by title..."
    >
      {search ? (
        <SearchList searchedGames={searchedGames} hovered={hovered} />
      ) : (
        <>
          <List.Item
            title="My Games"
            icon={{ source: "command-icon.png" }}
            actions={
              <ActionPanel>
                <Action.Push title="View My Games" target={<MyGames />} />
              </ActionPanel>
            }
          />
          <List.Item
            title="Search Steam Games"
            icon={{ source: "command-icon.png" }}
            actions={
              <ActionPanel>
                <Action.Push title="Search Games" target={<Search />} />
              </ActionPanel>
            }
          />
          <List.Section title="Recently Viewed Games"></List.Section>
          {recentlyPlayedGames && recentlyPlayedGames?.length > 0 ? (
            <List.Section title="Recently Played Games">
              {recentlyPlayedGames?.slice(0, 5).map((game) => (
                <MyGamesListType key={game.appid} game={game} />
              ))}
            </List.Section>
          ) : null}
          {myGames && myGames?.length > 0 ? (
            // TODO: Move to action panel
            <List.Section title="Most Played Games">
              {myGames
                ?.filter((g) => g?.name)
                ?.sort((a, b) => (a.playtime_forever > b.playtime_forever ? -1 : 1))
                ?.slice(0, 5)
                .map((game) => (
                  <MyGamesListType key={game.appid} game={game} />
                ))}
            </List.Section>
          ) : null}
        </>
      )}
    </List>
  );
};
