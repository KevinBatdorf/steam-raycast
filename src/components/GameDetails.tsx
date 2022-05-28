import { Detail, LocalStorage, showToast, Toast } from "@raycast/api";
import { useEffect, useRef } from "react";
import { useGameData } from "../lib/fetcher";
import { GameDataSimple, GameSimple } from "../types";

export const GameDetails = ({ game }: { game: GameSimple | GameDataSimple }) => {
  const { data: gameData, isError: error } = useGameData({ appid: game.appid });
  const once = useRef(false);

  const markdown = gameData
    ? `
![Game header image](${gameData.header_image})

${gameData.short_description}

`
    : null;

  // To do more here we would need an html to md converter

  useEffect(() => {
    if (error?.status === 404 && !once.current) {
      once.current = true;
      showToast({
        title: "Error",
        message: error.message,
        style: Toast.Style.Failure,
      });
    }
  }, [error]);

  useEffect(() => {
    if (!game?.appid || error) return;
    // prepend to localstorage max 10 entries
    LocalStorage.getItem("recently-viewed").then((gamesRaw) => {
      const games: GameSimple[] = gamesRaw ? JSON.parse(String(gamesRaw)) : [];
      if (games.some((g) => g.appid === game.appid)) return;
      const newItems = [game, ...(games?.slice(0, 9) ?? [])];
      LocalStorage.setItem("recently-viewed", JSON.stringify(newItems));
    });
  }, [game, error]);

  return (
    <Detail
      isLoading={!gameData}
      navigationTitle={gameData?.name}
      markdown={error ? error?.message : markdown}
      metadata={
        error ? null : (
          <Detail.Metadata>
            {gameData?.price_overview ? (
              <Detail.Metadata.Label title="Price" text={gameData?.price_overview.final_formatted} />
            ) : null}
            {gameData?.metacritic?.url ? (
              <Detail.Metadata.Link
                title="Data"
                text={
                  gameData?.metacritic?.score ? `Metacritic: ${gameData?.metacritic?.score.toString()}` : "Metacritic"
                }
                target={gameData.metacritic.url}
              />
            ) : null}
            {gameData?.developers?.length > 0 ? (
              <Detail.Metadata.TagList title="Developers">
                <Detail.Metadata.TagList.Item color={"#67c0f4"} text={gameData?.developers[0]} />
              </Detail.Metadata.TagList>
            ) : null}
            <Detail.Metadata.Separator />
            {gameData?.platforms ? (
              <Detail.Metadata.TagList title="Platform">
                {gameData.platforms?.windows && <Detail.Metadata.TagList.Item text="Windows" color={"#7eba43"} />}
                {gameData.platforms?.mac && <Detail.Metadata.TagList.Item text="Mac" color={"#512f5f"} />}
                {gameData.platforms?.linux && <Detail.Metadata.TagList.Item text="Linux" color={"#1893d1"} />}
              </Detail.Metadata.TagList>
            ) : null}
            <Detail.Metadata.Separator />
            {gameData?.steam_appid ? (
              <Detail.Metadata.Link
                title=""
                target={`https://store.steampowered.com/app/${gameData.steam_appid}`}
                text="Steam page"
              />
            ) : null}
            {gameData?.website ? <Detail.Metadata.Link title="" text="Website" target={gameData.website} /> : null}
          </Detail.Metadata>
        )
      }
    />
  );
};
