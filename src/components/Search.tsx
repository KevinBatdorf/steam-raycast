import { List } from "@raycast/api";
import { useState } from "react";
import { useGamesSearch } from "../lib/fetcher";
import { SearchedGame } from "./ListItems";
import { GameSimple } from "../types";

export const Search = () => {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(0);
  const { data: searchedGames } = useGamesSearch({ term: search, ready: search.length > 0 });
  return (
    <List
      isLoading={Boolean(search && !searchedGames?.length)}
      onSearchTextChange={setSearch}
      onSelectionChange={(id) => setHovered(Number(id ?? 0))}
      throttle
      // Check caching issue with title
      searchBarPlaceholder="Search for a game by title..."
    >
      <SearchList searchedGames={searchedGames} hovered={hovered} />
    </List>
  );
};

export const SearchList = ({ searchedGames, hovered }: { searchedGames?: GameSimple[]; hovered: number }) => {
  return (
    <List.Section title="Search Results">
      {searchedGames?.map((game) => (
        <SearchedGame key={game.appid} game={game} highlighted={hovered === game.appid} />
      ))}
    </List.Section>
  );
};
