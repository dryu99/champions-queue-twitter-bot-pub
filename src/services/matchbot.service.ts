import { existsSync, readFileSync, writeFileSync } from "fs";
import { ApiPlayer } from "../types";
import Config from "../utils/config";

// TODO change package json command for scraping to prod so it doesnt deal with caching behaviour
export class MatchBotService {
  public static async fetchPlayers(): Promise<ApiPlayer[]> {
    // check cache
    if (Config.NODE_ENV === "development" && existsSync("./api-players.json")) {
      const apiPlayersRaw = readFileSync("./api-players.json", {
        encoding: "utf-8",
      });
      const apiPlayers = JSON.parse(apiPlayersRaw) as ApiPlayer[];
      return apiPlayers;
    }

    const apiPlayersRaw = await fetch(
      "https://riot-nae-strapi-app.azurewebsites.net/api/ladder/3/1/1"
    );

    const apiPlayers = (await apiPlayersRaw.json()) as ApiPlayer[];

    // cache
    if (Config.NODE_ENV === "development") {
      writeFileSync("./api-players.json", JSON.stringify(apiPlayers));
    }

    return apiPlayers;
  }
}
