import { Action, ActionPanel, Detail, Icon, List } from "@raycast/api";
import { useState } from "react";
import { useGameData, useGamesSearch } from "./hooks";
import { GameSimple } from "./types";
import { SWRConfig } from "swr";
import { cacheProvider } from "./cache";
import { isFakeData } from "./fake";

const cacheKey = Math.floor(Math.random() * 10000);

const GamesList = () => {
  const { data: games, isValidating, isLoading } = useGamesSearch({ cacheKey });
  return (
    <List isLoading={isLoading || isValidating} searchBarPlaceholder="Search games by title">
      {games?.map((game) => (
        <List.Item
          key={game.appid}
          title={game.name}
          actions={
            <ActionPanel title="">
              <Action.Push title="View game details" target={<GameData appid={game.appid} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};
const GameData = ({ appid }: { appid: number }) => {
  const { data: gameData } = useGameData(appid);

  return <Detail markdown={JSON.stringify(gameData)} />;
};

export default function Command() {
  return (
    <SWRConfig value={{ provider: isFakeData ? undefined : cacheProvider }}>
      <GamesList />
    </SWRConfig>
  );
}
// TODO:
// 0. handle search clear as you type
// 1. Check on locale currency
// 2. Format data into a good view
// 3. Keep history state of previously viewed games
// 4. Add place to enter API key - optional

// TODO account
// 1. Search accout when they view a game
