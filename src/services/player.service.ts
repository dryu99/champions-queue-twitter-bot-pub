import mongoose from "mongoose";

// should reflect contents of leaderboard API endpoint
interface Player {
  summonerId: number;
  summonerName: string;
  summonerNameWithTeam: string;
  team: string;
  socialLinks: SocialLink[];
  lcSummonerNameWithTeam: string; // lower case
  seasonId: number;
  splitId: number;
  year: number;
  league: string;
  org: string;
  // TODO season, year, split, other date fields
  // TODO isStarter
}

interface TwitchPlayer {
  summonerNameWithTeam: string;
  primaryRole: string;
  twitchId: string;
}

type SocialLink = {
  platform: "twitter" | "twitch" | "youtube";
  link: string;
};

const PlayerSchema = new mongoose.Schema<Player>({
  summonerId: { type: Number, required: true },
  summonerName: { type: String, required: true },
  summonerNameWithTeam: { type: String, required: true },
  lcSummonerNameWithTeam: { type: String, required: true },
  team: { type: String, required: false }, // setting as optional here even tho interface doesn't since mongo doesn't allow empty strings on required: true
  org: { type: String, required: false },
  seasonId: { type: Number, required: true },
  splitId: { type: Number, required: true },
  year: { type: Number, required: true },
  league: { type: String, required: true },
  socialLinks: {
    type: [
      {
        platform: String,
        link: String,
      },
    ],
    required: true,
  },
});

PlayerSchema.set("timestamps", true);

const PlayerModel = mongoose.model("Player", PlayerSchema);

export default class PlayerService {
  public static async getAllTwitch(): Promise<TwitchPlayer[]> {
    const mongoPlayers = await PlayerModel.find({});
    return mongoPlayers
      .filter(
        (mongoPlayer) =>
          mongoPlayer.socialLinks.findIndex(
            (socialLink) => socialLink.platform === "twitch"
          ) !== -1
      )
      .map((mongoPlayer) => {
        const twitchUrl = mongoPlayer.socialLinks.find(
          (socialLink) => socialLink.platform === "twitch"
        )!.link;

        const urlParts = twitchUrl.split("/");
        const twitchId = urlParts[urlParts.length - 1]
          ? urlParts[urlParts.length - 1]
          : urlParts[urlParts.length - 2]; // prob '/' at end

        return {
          summonerNameWithTeam: mongoPlayer.summonerNameWithTeam,
          twitchId,
          primaryRole: "TOP", // TODO lol
        };
      });
  }
}
