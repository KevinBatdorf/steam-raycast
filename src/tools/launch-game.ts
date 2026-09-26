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
    message: `Launch ${game.name} in Steam?`,
    info: [{ name: "App ID", value: String(game.appid) }],
  };
};

/**
 * Launch a Steam game on this computer through the Steam client. If it is not installed, Steam offers to install it.
 * Use this only when the user asks to play, start, or launch a game.
 */
export default async function launchGameTool(input: Input) {
  const game = await resolveSteamGameTarget(input);
  await open(`steam://rungameid/${game.appid}`);
  return { game, opened: true };
}
