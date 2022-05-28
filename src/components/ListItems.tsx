import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { GameData, GameDataSimple, GameSimple } from "../types";
import { DefaultActions } from "./Actions";
import { GameDetails } from "./GameDetails";
import { humanTime } from "../lib/util";
import { useGameData } from "../lib/fetcher";
import { useEffect, useState } from "react";

export const SearchedGame = ({ game, highlighted }: { game: GameSimple; highlighted: boolean }) => {
  const [gameData, setGameData] = useState<GameData>();
  const [notFound, setNotFound] = useState(false);
  const [iconColor, setIconColor] = useState<Color.ColorLike>();
  const { data, isError: error } = useGameData({ appid: game.appid, ready: highlighted });

  useEffect(() => {
    // console.log({ data });
    if (!data) return;
    setIconColor(Color.Green);
    setGameData(data);
  }, [data]);

  useEffect(() => {
    if (error) {
      setIconColor(Color.Red);
      setNotFound(true);
    }
  }, [error]);

  return (
    <List.Item
      title={game.name}
      subtitle={gameData?.type === "game" ? undefined : gameData?.type}
      id={game.appid.toString()}
      icon={{
        source: Icon.Circle,
        tintColor: iconColor,
      }}
      //   icon={{
      //     source: gameData?.img_icon_url
      //       ? `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${gameData.img_icon_url}.jpg`
      //       : "",
      //   }}
      accessories={[{ text: notFound ? "Game not found" : gameData?.release_date?.date }]}
      actions={
        <ActionPanel>
          <Action.Push title="View Game Details" target={<GameDetails appid={game.appid} />} />
          <DefaultActions />
        </ActionPanel>
      }
    />
  );
};

export const MyGamesListType = ({ game }: { game: GameDataSimple }) => (
  <List.Item
    key={game.appid}
    title={game.name}
    icon={{
      source: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
    }}
    accessories={[{ text: game?.playtime_forever ? `Played for ${humanTime(game.playtime_forever)}` : undefined }]}
    actions={
      <ActionPanel>
        <Action.Push title="View Game Details" target={<GameDetails appid={game.appid} />} />
        <DefaultActions />
      </ActionPanel>
    }
  />
);
