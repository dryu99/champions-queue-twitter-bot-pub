import { TwitterApi, TwitterApiReadWrite } from "twitter-api-v2";
import { Match, MatchPlayer } from "../types";
import Config from "../utils/config";
import logger from "../utils/logger";

export default class TwitterService {
  private static readonly BOT_USERNAME = "whysoryude";
  private static twitterClient: TwitterApiReadWrite;

  public static init() {
    this.twitterClient = new TwitterApi({
      appKey: Config.TWITTER_API_KEY,
      appSecret: Config.TWITTER_API_KEY_SECRET,
      accessToken: Config.TWITTER_ACCESS_TOKEN,
      accessSecret: Config.TWITTER_ACCESS_TOKEN_SECRET,
    }).readWrite;

    logger.info("connected to twitter");
  }

  public static tweetMatch(match: Match): Promise<void> {
    const tweetText = this.buildMatchTweetText(match);

    return this.twitterClient.v2
      .tweet(tweetText)
      .then(() => {
        logger.info("tweet successfully created", { tweetText });
      })
      .catch((err) => {
        logger.error("something went wrong", err);
      });
  }

  public static async isMatchTweeted(match: Match): Promise<boolean> {
    const searchText = this.buildMatchTweetText(match);
    const result = await this.twitterClient.v2.search(
      `"${searchText}" (from:${this.BOT_USERNAME})`
    );

    return result.data.meta.result_count > 0;
  }

  // TODO how to include streaming players? can prob check the playermap (add an isLive field)
  private static buildMatchTweetText(match: Match): string {
    let text = "";

    text += `TOP 🏔 ${this.buildMatchPlayerText(match.blueTeam[0])}\n`;
    text += `JGL 🌲 ${this.buildMatchPlayerText(match.blueTeam[1])}\n`;
    text += `MID 🪄 ${this.buildMatchPlayerText(match.blueTeam[2])}\n`;
    text += `BOT 🏹 ${this.buildMatchPlayerText(match.blueTeam[3])}\n`;
    text += `SUP 🛡 ${this.buildMatchPlayerText(match.blueTeam[4])}\n\n`;

    text += "vs\n\n";

    text += `TOP 🏔 ${this.buildMatchPlayerText(match.redTeam[0])}\n`;
    text += `JGL 🌲 ${this.buildMatchPlayerText(match.redTeam[1])}\n`;
    text += `MID 🪄 ${this.buildMatchPlayerText(match.redTeam[2])}\n`;
    text += `BOT 🏹 ${this.buildMatchPlayerText(match.redTeam[3])}\n`;
    text += `SUP 🛡 ${this.buildMatchPlayerText(match.redTeam[4])}`;

    return text;
  }

  private static buildMatchPlayerText(matchPlayer: MatchPlayer): string {
    let text = matchPlayer.summonerNameWithTeam;

    if (matchPlayer.isStreaming) {
      text += ` (https://www.twitch.tv/${matchPlayer.twitchUsername})`;
    }

    return text;
  }
}
