import mongoose from "mongoose";
import { Region } from "../types";

// should reflect contents of leaderboard API endpoint
export interface DbPlayer {
  id: string;
  summonerName: string;
  summonerNameWithTeam: string;
  twitterLink?: string;
  twitchLink?: string;
  lcSummonerName: string; // lowercase
  role?: string;
  region: string;

  // outdated fields we don't need
  summonerId?: number;
  team?: string;
  org?: string;
  seasonId?: number;
  splitId?: number;
  year?: number;
  league?: string;
}

export interface TwitchPlayer {
  summonerNameWithTeam: string;
  summonerName: string;
  twitchUsername?: string;
  twitterUsername?: string;
  isStreaming: boolean;
}

const PlayerSchema = new mongoose.Schema<DbPlayer>({
  summonerId: { type: Number, required: false },
  summonerName: { type: String, required: true },
  summonerNameWithTeam: { type: String, required: true },
  lcSummonerName: { type: String, required: true },
  team: { type: String, required: false }, // setting as optional here even tho interface doesn't since mongo doesn't allow empty strings on required: true
  org: { type: String, required: false },
  twitterLink: { type: String, required: false },
  twitchLink: { type: String, required: false },
  seasonId: { type: Number, required: false },
  splitId: { type: Number, required: false },
  year: { type: Number, required: false },
  league: { type: String, required: false },
  role: { type: String, required: false },
  region: { type: String, required: true },
});

PlayerSchema.set("timestamps", true);

export const PlayerModel = mongoose.model("Player", PlayerSchema);

export default class PlayerService {
  public static async addOne(
    newPlayer: Omit<DbPlayer, "id">
  ): Promise<DbPlayer> {
    const mongoPlayer = new PlayerModel(newPlayer);
    return mongoPlayer.save();
  }

  public static async getAllTwitch(region: Region): Promise<TwitchPlayer[]> {
    const mongoPlayers = await PlayerModel.find({ region: { $exists: true } });
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
      id: mongoPlayer.id,
      summonerName: mongoPlayer.summonerName,
      summonerNameWithTeam: mongoPlayer.summonerNameWithTeam,
      lcSummonerName: mongoPlayer.lcSummonerName,
      role: mongoPlayer.role,
      region: mongoPlayer.region,
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
