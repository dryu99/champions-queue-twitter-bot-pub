import { TwitterApi, TwitterApiReadWrite } from "twitter-api-v2";
import { Match, TwitchUsername } from "../types";
import LiveGameUpdate from "../ui/components/live-game-update";
import Config from "../utils/config";
import logger from "../utils/logger";
import BugService from "./bug.service";
import HtmlService from "./html.service";
import ImageService from "./image.service";
import { SpecialChannel } from "./twitch.service";

export type MatchTweetData = {
  match: Match;
  authorUrl: TwitchUsername;
  communityChannels?: SpecialChannel[];
};

export default class TwitterService {
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

  public static async tweetMatch(matchData: MatchTweetData): Promise<void> {
    const tweetText = this.buildMatchTweetText(matchData);
    const html = HtmlService.buildComponentHtml(LiveGameUpdate, { matchData });

    logger.info("tweeting match", { tweetText });
    ImageService.savePng(html, {
      width: 610,
      height: 400,
    })
      .then((imgBuffer) =>
        this.twitterClient.v1.uploadMedia(imgBuffer, { mimeType: "png" })
      )
      .then((mediaId) =>
        this.twitterClient.v2.tweet(tweetText, {
          media: { media_ids: [mediaId] },
        })
      )
      .then((result) => {
        logger.info("tweet successfully created", { result });
      })
      .catch((error) => {
        logger.error("tweet creation failed", error);
        BugService.captureException(error);
      });
  }

  // TODO maybe this should live in match service
  private static buildMatchTweetText(matchData: MatchTweetData): string {
    const { blueTeam, redTeam } = matchData.match;
    let text = "";

    for (const player of [...blueTeam, ...redTeam]) {
      if (!player.isStreaming) continue;
      if (player.twitchUsername) {
        text += `📺 www.twitch.tv/${player.twitchUsername}\n`;
      }

      // if (player.twitterUsername) {
      //   text += ` | @${player.twitterUsername}\n`;
      // }
    }

    if (matchData.communityChannels) {
      for (const communityChannel of matchData.communityChannels) {
        text += `📺 www.twitch.tv/${communityChannel.twitchUsername} | @${communityChannel.twitterUsername}\n`;
      }
    }

    text += `\n👑 Thank you ${matchData.authorUrl} for generating this update 👑`;
    return text;
  }
}
