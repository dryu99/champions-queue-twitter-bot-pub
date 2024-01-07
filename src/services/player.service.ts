import mongoose from "mongoose";
import { Region } from "../types";

// should reflect contents of leaderboard API endpoint
export interface DbPlayer {
  summonerId: number;
  summonerName: string;
  summonerNameWithTeam: string;
  team: string;
  twitterLink?: string;
  twitchLink?: string;
  lcSummonerName: string; // lowercase
  seasonId: number;
  splitId: number;
  year: number;
  league: string;
  org: string;
  role?: string;
  region: string;
}

export interface TwitchPlayer {
  summonerNameWithTeam: string;
  summonerName: string;
  twitchUsername?: string;
  twitterUsername?: string;
  isStreaming: boolean;
}

const PlayerSchema = new mongoose.Schema<DbPlayer>({
  summonerId: { type: Number, required: true },
  summonerName: { type: String, required: true },
  summonerNameWithTeam: { type: String, required: true },
  lcSummonerName: { type: String, required: true },
  team: { type: String, required: false }, // setting as optional here even tho interface doesn't since mongo doesn't allow empty strings on required: true
  org: { type: String, required: false },
  twitterLink: { type: String, required: false },
  twitchLink: { type: String, required: false },
  seasonId: { type: Number, required: true },
  splitId: { type: Number, required: true },
  year: { type: Number, required: true },
  league: { type: String, required: true },
  role: { type: String, required: false },
  region: { type: String, required: true },
});

PlayerSchema.set("timestamps", true);

export const PlayerModel = mongoose.model("Player", PlayerSchema);

export default class PlayerService {
  public static async getAllTwitch(region: Region): Promise<TwitchPlayer[]> {
    const mongoPlayers = await PlayerModel.find({ region });
    return mongoPlayers.map((mongoPlayer) => {
      return {
        summonerName: mongoPlayer.summonerName,
        summonerNameWithTeam: mongoPlayer.summonerNameWithTeam,
        twitterUsername: this.getUsernameFromLink(mongoPlayer.twitterLink),
        twitchUsername: this.getUsernameFromLink(mongoPlayer.twitchLink),
        isStreaming: false,
      };
    });
  }

  public static async getOneBySummonerName(
    summonerName: string
  ): Promise<DbPlayer | undefined> {
    const mongoPlayer = await PlayerModel.findOne({
      lcSummonerName: summonerName.toLowerCase(),
    });

    if (!mongoPlayer) return undefined;

    return {
      ...mongoPlayer,
      twitterLink: this.getUsernameFromLink(mongoPlayer?.twitterLink),
      twitchLink: this.getUsernameFromLink(mongoPlayer?.twitchLink),
    };
  }

  private static getUsernameFromLink(
    link: string | undefined
  ): string | undefined {
    if (!link) return undefined;

    const urlParts = link.split("/");
    return urlParts[urlParts.length - 1]
      ? urlParts[urlParts.length - 1]
      : urlParts[urlParts.length - 2];
  }
}
