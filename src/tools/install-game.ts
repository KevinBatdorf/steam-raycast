import { open, Tool } from "@raycast/api";
import { resolveSteamGameTarget } from "../lib/games";

type Input = {
  /**
   * Steam app ID of the game. Prefer this when another Steam tool already returned the app ID.
   */
  appid?: number;
  /**
   * Game title to look up when no app ID is known, for example "Hades".
   */
  query?: string;
};

export const confirmation: Tool.Confirmation<Input> = async (input) => {
  const game = await resolveSteamGameTarget(input);
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
  const game = await resolveSteamGameTarget(input);
  await open(`steam://install/${game.appid}`);
  return { game, opened: true };
}
