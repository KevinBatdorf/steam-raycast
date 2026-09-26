import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { GameDataSimple, GameSimple } from "../types";
import { DefaultActions, LaunchActions } from "./Actions";
import { GameDetails } from "./GameDetails";
import { humanTime } from "../lib/util";
import { useGameData } from "../lib/fetcher";

export const DynamicGameListItem = ({
  game,
  context,
  ready,
  myGames = [],
}: {
  game: GameSimple;
  context: "recent" | "recently-viewed" | "random" | "Search";
  ready: boolean;
  myGames?: GameDataSimple[];
}) => {
  const { data: gameData, isError: error } = useGameData({ appid: game.appid, execute: ready });
  const owned = myGames.find((g) => g.appid === game.appid);
  const image = owned?.img_icon_url
    ? `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${game.appid}/${owned.img_icon_url}.jpg`
    : game.icon;
  const genericIcon = {
    source: gameData?.type === "game" ? Icon.GameController : Icon.Circle,
    tintColor: error ? Color.Red : gameData ? Color.SecondaryText : undefined,
  };

  return (
    <List.Item
      title={game?.name ?? ""}
      subtitle={gameData?.type === "game" ? undefined : gameData?.type}
      id={context + (game?.appid ? game.appid.toString() : "")}
      icon={image ? { source: image } : genericIcon}
      accessories={[{ text: error ? "Game not found" : gameData?.release_date?.date }]}
      actions={
        <ActionPanel>
          <Action.Push
            icon={Icon.Sidebar}
            title="View Game Details"
            target={<GameDetails game={{ appid: game.appid, name: game.name, icon: game.icon }} />}
          />
          <LaunchActions name={game.name} appid={game?.appid} />
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
    accessories={[{ text: game?.playtime_forever ? "Played for " + humanTime(game.playtime_forever) : undefined }]}
    actions={
      <ActionPanel>
        <Action.Push icon={Icon.Sidebar} title="View Game Details" target={<GameDetails game={game} />} />
        <LaunchActions name={game.name} appid={game?.appid} />
        <DefaultActions />
      </ActionPanel>
    }
  />
);
