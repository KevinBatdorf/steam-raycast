import { List } from "@raycast/api";
import { useState } from "react";
import { useMyGames, useRandomGames } from "../lib/fetcher";
import { appidFromItemId } from "../lib/util";
import { DynamicGameListItem } from "./ListItems";

export const RandomGamesList = () => {
  const { data: games, isLoading } = useRandomGames();
  const [hovered, setHovered] = useState(0);
  const { data: myGames } = useMyGames();

  return (
    <List
      navigationTitle="Random Games"
      filtering={false}
      isLoading={isLoading}
      searchBarPlaceholder=""
      onSelectionChange={(id) => setHovered(appidFromItemId(id))}
    >
      {games?.map((game) => (
        <DynamicGameListItem
          context="random"
          key={game.appid}
          game={game}
          ready={hovered === game.appid}
          myGames={myGames}
        />
      ))}
    </List>
  );
};
