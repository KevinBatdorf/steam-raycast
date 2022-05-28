import { Detail, showToast, Toast } from "@raycast/api";
import { useEffect, useRef } from "react";
import { useGameData } from "../lib/fetcher";

export const GameDetails = ({ appid }: { appid: number }) => {
  const { data: gameData, isError: error } = useGameData({ appid });
  const once = useRef(false);

  const markdown = gameData
    ? `
![Game header image](${gameData.header_image})

${gameData.short_description}

`
    : null;

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

  return (
    <Detail
      navigationTitle={gameData?.name}
      markdown={error ? error?.message : markdown}
      metadata={
        <Detail.Metadata>
          {gameData?.price_overview && (
            <Detail.Metadata.Label title="Price" text={gameData?.price_overview.final_formatted} />
          )}
          {/* <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text="Electric" color={"#eed535"} />
          </Detail.Metadata.TagList> */}
          <Detail.Metadata.Separator />
          {gameData?.steam_appid && (
            <Detail.Metadata.Link
              title="Links"
              target={`https://store.steampowered.com/app/${gameData.steam_appid}`}
              text="Steam page"
            />
          )}
          {gameData?.website && <Detail.Metadata.Link title="" text="Website" target={gameData.website} />}
        </Detail.Metadata>
      }
    />
  );
};
