import { ApiPlayer } from "../types";

export class MatchBotService {
  public static async fetchPlayers(): Promise<ApiPlayer[]> {
    const apiPlayersRaw = await fetch(
      "https://riot-nae-strapi-app.azurewebsites.net/api/ladder/3/1/1"
    );

    const apiPlayers = (await apiPlayersRaw.json()) as ApiPlayer[];
    return apiPlayers;
  }
}
