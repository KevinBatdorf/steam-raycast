import { open, Tool } from "@raycast/api";
import { resolveSteamGameById } from "../lib/games";

type Input = {
  /**
   * Steam app ID of the game. When the user names a game, find its app ID with Search Steam Games or Get Owned Games first.
   */
  appid: number;
};

export const confirmation: Tool.Confirmation<Input> = async (input) => {
  const game = await resolveSteamGameById(input.appid);
  return {
    message: `Install ${game.name} in Steam?`,
    info: [{ name: "App ID", value: String(game.appid) }],
  };
};

/**
 * Open Steam's install dialog for a game on this computer.
 * Use this only when the user asks to install or download a game.
 */
export default async function installGameTool(input: Input) {
  const game = await resolveSteamGameById(input.appid);
  await open(`steam://install/${game.appid}`);
  return { game, opened: true };
}
