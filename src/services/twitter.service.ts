import { text } from "stream/consumers";
import { TwitterApi, TwitterApiReadWrite } from "twitter-api-v2";
import { Match, MatchPlayer, TwitchUsername } from "../types";
import Config from "../utils/config";
import logger from "../utils/logger";
import ChampsQueueService from "./champs-queue.service";

export type MatchTweetData = {
  match: Match;
  author: TwitchUsername;
};

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

  public static tweetMatch(matchData: MatchTweetData): Promise<void> {
    const playersTweetText = this.buildMatchTweetText(matchData);
    const linksTweetText = this.buildLinksTweetText(matchData);

    return this.twitterClient.v2
      .tweetThread([playersTweetText, linksTweetText])
      .then((result) => {
        logger.info("tweet successfully created", {
          playersTweetText,
          linksTweetText,
          result,
        });
      })
      .catch((error) => {
        logger.error("tweet creation failed", {
          error,
          playersTweetText,
          linksTweetText,
        });
      });
  }

  public static async isMatchTweeted(
    matchData: MatchTweetData
  ): Promise<boolean> {
    const searchText = this.buildMatchTweetText(matchData);
    const result = await this.twitterClient.v2.search(
      `"${searchText}" (from:${this.BOT_USERNAME})`
    ); // twitter throws error on duplicate content too "You are not allowed to create a Tweet with duplicate content."

    return result.data.meta.result_count > 0;
  }

  private static buildMatchTweetText(matchData: MatchTweetData): string {
    const { blueTeam, redTeam } = matchData.match;
    let text = "";

    text += `TOP 🏔 ${this.buildPlayerText(blueTeam[0])}\n`;
    text += `JGL 🌲 ${this.buildPlayerText(blueTeam[1])}\n`;
    text += `MID 🪄 ${this.buildPlayerText(blueTeam[2])}\n`;
    text += `BOT 🏹 ${this.buildPlayerText(blueTeam[3])}\n`;
    text += `SUP 🛡 ${this.buildPlayerText(blueTeam[4])}\n\n`;

    text += "vs\n\n";

    text += `TOP 🏔 ${this.buildPlayerText(redTeam[0])}\n`;
    text += `JGL 🌲 ${this.buildPlayerText(redTeam[1])}\n`;
    text += `MID 🪄 ${this.buildPlayerText(redTeam[2])}\n`;
    text += `BOT 🏹 ${this.buildPlayerText(redTeam[3])}\n`;
    text += `SUP 🛡 ${this.buildPlayerText(redTeam[4])}`;

    // text += `Patch: ${ChampsQueueService.CQ_CURR_PATCH}\n`;

    return text;
  }

  private static buildPlayerText(
    matchPlayer: MatchPlayer,
    includeLinks: boolean = true
  ): string {
    let text = matchPlayer.summonerNameWithTeam;

    if (matchPlayer.isStreaming && includeLinks) {
      text += ` 📺`;
    }

    return text;
  }

  private static buildLinksTweetText(matchData: MatchTweetData): string {
    let text = "Stream Links:\n";

    const players = [...matchData.match.blueTeam, ...matchData.match.redTeam];
    for (const player of players) {
      if (!player.isStreaming || !player.twitchUsername) continue;
      text += `📺 https://www.twitch.tv/${player.twitchUsername}\n`;
    }

    text += `\nThank you https://www.twitch.tv/${matchData.author} for generating this update! 👑`;

    return text;
  }
}
