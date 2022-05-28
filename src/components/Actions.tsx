import { Action, ActionPanel } from "@raycast/api";
import { GameDataSimple } from "../types";
import { MyGames } from "./MyGames";
import { RandomGamesList } from "./RandomGamesList";
import { RecentlyPlayedGames } from "./RecentlyPlayedGames";

export const DefaultActions = () => (
  <ActionPanel.Section title="Common Commands">
    <Action.Push title="View My Games" target={<MyGames />} />
    <Action.Push
      title="View Most Played Games"
      target={
        <MyGames
          sortBy="playtime_forever"
          extraFilter={(g: GameDataSimple) => Boolean(g.playtime_forever)}
          order="desc"
        />
      }
    />
    <Action.Push title="View Recently Played Games" target={<RecentlyPlayedGames />} />
    <Action.Push title="View Random Games" target={<RandomGamesList />} />
  </ActionPanel.Section>
);
