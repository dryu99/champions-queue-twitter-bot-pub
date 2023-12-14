import mongoose from "mongoose";

// should reflect contents of leaderboard API endpoint
interface Player {
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
  isStreaming: boolean;
}

const PlayerSchema = new mongoose.Schema<Player>({
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

const PlayerModel = mongoose.model("Player", PlayerSchema);

export default class PlayerService {
  public static async getAllTwitch(): Promise<TwitchPlayer[]> {
    const mongoPlayers = await PlayerModel.find({});
    return mongoPlayers.map((mongoPlayer) => {
      if (!mongoPlayer.twitchLink) {
        return {
          summonerName: mongoPlayer.summonerName,
          summonerNameWithTeam: mongoPlayer.summonerNameWithTeam,
          isStreaming: false,
        };
      }

      const urlParts = mongoPlayer.twitchLink.split("/");
      const twitchUsername = urlParts[urlParts.length - 1]
        ? urlParts[urlParts.length - 1]
        : urlParts[urlParts.length - 2];

      return {
        summonerName: mongoPlayer.summonerName,
        summonerNameWithTeam: mongoPlayer.summonerNameWithTeam,
        twitchUsername,
        isStreaming: false,
      };
    });
  }
}
