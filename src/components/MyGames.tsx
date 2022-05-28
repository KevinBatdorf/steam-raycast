import { List } from "@raycast/api";
import { useMyGames } from "../lib/fetcher";
import { MyGamesListType } from "./ListItems";

export const MyGames = () => {
  const { data: myGames, isLoading } = useMyGames();
  return (
    <List isLoading={isLoading}>
      {myGames
        ?.filter((g) => g?.name)
        ?.sort((a, b) => (a.playtime_forever > b.playtime_forever ? -1 : 1))
        ?.map((game) => (
          <MyGamesListType key={game.appid} game={game} />
        ))}
    </List>
  );
};
