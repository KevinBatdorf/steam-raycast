import { List } from "@raycast/api";
import { useRecentlyPlayedGames } from "../lib/fetcher";
import { MyGamesListType } from "./ListItems";

export const RecentlyPlayedGames = () => {
  const { data: recentGames, isLoading } = useRecentlyPlayedGames();
  return (
    <List isLoading={isLoading}>
      {recentGames?.map((game) => (
        <MyGamesListType key={game.appid} game={game} />
      ))}
    </List>
  );
};
