import { Icon, List } from "@raycast/api";
import { useState } from "react";
import { useGamesSearch, useMyGames } from "../lib/fetcher";
import { useShowingDetail } from "../lib/hooks";
import { appidFromItemId } from "../lib/util";
import { DynamicGameListItem } from "./ListItems";
import { GameSimple } from "../types";

export const Search = () => {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(0);
  const { showingDetail, toggleDetail } = useShowingDetail();
  const { data: searchedGames, isLoading, isError } = useGamesSearch({ term: search, execute: search.length > 0 });
  return (
    <List
      isLoading={isLoading}
      isShowingDetail={showingDetail && Boolean(searchedGames?.length)}
      onSearchTextChange={setSearch}
      onSelectionChange={(id) => setHovered(appidFromItemId(id))}
      throttle
      searchBarPlaceholder="Search for a game by title..."
    >
      <SearchList
        search={search}
        searchedGames={searchedGames}
        isLoading={isLoading}
        error={isError}
        hovered={hovered}
        showingDetail={showingDetail}
        onToggleDetail={toggleDetail}
      />
    </List>
  );
};

export const SearchList = ({
  search,
  searchedGames,
  isLoading,
  error,
  hovered,
  showingDetail,
  onToggleDetail,
}: {
  search: string;
  searchedGames?: GameSimple[];
  isLoading: boolean;
  error?: Error;
  hovered: number;
  showingDetail: boolean;
  onToggleDetail: () => void;
}) => {
  const { data: myGames } = useMyGames();
  if (!search.trim()) return <List.EmptyView icon={Icon.MagnifyingGlass} title="Search Steam Games" />;
  if (!isLoading && !searchedGames?.length) {
    return (
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={error ? "Could Not Search Steam" : "No Games Found"}
        description={error ? error.message : "Try a different title."}
      />
    );
  }
  return (
    <List.Section title="Search Results">
      {searchedGames?.map((game) => (
        <DynamicGameListItem
          context="Search"
          key={game.appid}
          game={game}
          ready={hovered === game.appid}
          myGames={myGames}
          showingDetail={showingDetail}
          onToggleDetail={onToggleDetail}
        />
      ))}
    </List.Section>
  );
};
