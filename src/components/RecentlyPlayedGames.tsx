import { Icon, List } from "@raycast/api";
import { NoApiKey } from "../errors";
import { useRecentlyPlayedGames } from "../lib/fetcher";
import { useIsLoggedIn } from "../lib/hooks";
import { MyGamesListType } from "./ListItems";

export const RecentlyPlayedGames = () => {
  const { data: recentGames, isLoading } = useRecentlyPlayedGames();
  const isLoggedIn = useIsLoggedIn();

  if (!isLoggedIn) return <NoApiKey />;
  return (
    <List navigationTitle="Recently Played Games" isLoading={isLoading}>
      {!isLoading && !recentGames?.length ? (
        <List.EmptyView icon={Icon.GameController} title="Nothing Played in the Last Two Weeks" />
      ) : null}
      {recentGames?.map((game) => (
        <MyGamesListType key={game.appid} game={game} />
      ))}
    </List>
  );
};
