import { JSX } from "react";
import {
  Action,
  ActionPanel,
  Icon,
  LaunchType,
  LocalStorage,
  Toast,
  open,
  showToast,
  useNavigation,
} from "@raycast/api";
import { crossLaunchCommand } from "raycast-cross-extension";
import { GameDataSimple } from "../types";
import { GameNews } from "./GameNews";
import { MyGames } from "./MyGames";
import { RandomGamesList } from "./RandomGamesList";
import { RecentlyPlayedGames } from "./RecentlyPlayedGames";

export const DefaultActions = () => {
  const { push, pop } = useNavigation();
  // Reset to top level to avoid deeply nested navigation
  const replaceWith = (view: JSX.Element) => {
    pop();
    push(view);
  };
  return (
    <ActionPanel.Section title="Common Commands">
      <Action title="View My Games" icon={Icon.List} onAction={() => replaceWith(<MyGames />)} />
      <Action
        icon={Icon.List}
        title="View Most Played Games"
        onAction={() =>
          replaceWith(
            <MyGames
              sortBy="playtime_forever"
              extraFilter={(g: GameDataSimple) => Boolean(g.playtime_forever)}
              order="desc"
            />,
          )
        }
      />
      <Action
        icon={Icon.List}
        title="View Recently Played Games"
        onAction={() => replaceWith(<RecentlyPlayedGames />)}
      />
      <Action icon={Icon.List} title="View Random Games" onAction={() => replaceWith(<RandomGamesList />)} />
      <Action
        icon={Icon.XMarkCircle}
        title="Clear Recent History"
        onAction={async () => {
          await LocalStorage.removeItem("recently-viewed");
          await showToast({
            title: "Success. Reload to see changes",
            style: Toast.Style.Success,
          });
        }}
      />
    </ActionPanel.Section>
  );
};

export const LaunchActions = ({ name = "", appid = 0 }) => {
  if (!appid) return null;
  return (
    <ActionPanel.Section>
      <Action.OpenInBrowser title="View in Browser" url={`https://store.steampowered.com/app/${appid}`} />
      <Action.Push icon={Icon.Megaphone} title="View News" target={<GameNews appid={appid} name={name} />} />
      <Action.OpenInBrowser
        icon={Icon.Binoculars}
        // eslint-disable-next-line @raycast/prefer-title-case
        title="View on SteamDB"
        url={`https://steamdb.info/app/${appid}`}
      />
      <Action
        icon={Icon.Image}
        // eslint-disable-next-line @raycast/prefer-title-case
        title="Browse SteamGridDB Images"
        onAction={() => {
          crossLaunchCommand({
            name: "browse",
            type: LaunchType.UserInitiated,
            extensionName: "steamgriddb",
            ownerOrAuthorName: "litomore",
            context: {
              steamAppId: appid,
            },
          }).catch(() => {
            open(`${process.env.RAYCAST_SCHEME ?? "raycast"}://extensions/litomore/steamgriddb`);
          });
        }}
      />
      <Action
        icon={Icon.StarCircle}
        // eslint-disable-next-line @raycast/prefer-title-case
        title="View ProtonDB Score"
        onAction={() => {
          crossLaunchCommand({
            name: "browse",
            type: LaunchType.UserInitiated,
            extensionName: "protondb",
            ownerOrAuthorName: "litomore",
            context: {
              steamAppName: name,
            },
          }).catch(() => {
            open(`${process.env.RAYCAST_SCHEME ?? "raycast"}://extensions/litomore/protondb`);
          });
        }}
      />
      <Action.Open icon={Icon.Window} title="View in Steam" target={`steam://nav/games/details/${appid}`} />
      <Action.Open icon={Icon.Window} title="Open Store Page in Steam" target={`steam://store/${appid}`} />
      <Action.Open icon={Icon.ArrowRight} title="Launch Game" target={`steam://rungameid/${appid}`} />
      <Action.Open icon={Icon.Download} title="Install Game" target={`steam://install/${appid}`} />
    </ActionPanel.Section>
  );
};
