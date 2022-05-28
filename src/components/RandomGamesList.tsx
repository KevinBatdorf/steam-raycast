import { Action, ActionPanel, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { useGamesSearch } from "../lib/fetcher";
import { GameDetails } from "./GameDetails";

export const RandomGamesList = () => {
  const [cacheKey, setCacheKey] = useState(0);
  const { data: games, isLoading } = useGamesSearch({ cacheKey, ready: cacheKey > 0 });

  useEffect(() => {
    if (cacheKey) return;
    setCacheKey(Math.floor(Math.random() * 10000));
  }, [cacheKey]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search games by title">
      {games?.map((game) => (
        <List.Item
          key={game.appid}
          accessoryTitle={game.appid.toString()}
          title={game.name}
          actions={
            <ActionPanel title="">
              <Action.Push title="View game details" target={<GameDetails appid={game.appid} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};
