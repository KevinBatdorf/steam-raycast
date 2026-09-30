import { faker } from "@faker-js/faker";
import { environment } from "@raycast/api";
import { GameSimple } from "./types";

function fakeGame() {
  return {
    appid: +Math.random().toString().slice(2, 19),
    name: faker.hacker.noun(),
  };
}

export function fakeGames(count: number) {
  const games = new Array<GameSimple>();
  for (let i = 0; i < count; i++) {
    games.push(fakeGame());
  }
  return games;
}

export const isFakeData = false;
