import { writeFileSync } from "fs";
import path from "path";
import { TwitterApi, TwitterApiReadWrite } from "twitter-api-v2";
import {
  LeaderboardPlayer,
  LpGainLeaderboardPlayer,
  Match,
  Region,
  TwitchUsername,
} from "../types";
import LiveGameUpdate from "../ui/components/live-game-update";
import LpGainLeaderboard from "../ui/components/lp-gain-leaderboard";
import LpLeaderboard from "../ui/components/lp-leaderboard";
import Config from "../utils/config";
import logger from "../utils/logger";
import BugService from "./bug.service";
import ChampsQueueService from "./champs-queue.service";
import HtmlService from "./html.service";
import ImageService from "./image.service";
import { SpecialChannel } from "./twitch.service";

export type MatchTweetData = {
  match: Match;
  authorUrl?: TwitchUsername;
  communityChannels?: SpecialChannel[];
  region: Region;
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

  public static async tweetLpLeaderboard(
    players: LeaderboardPlayer[]
  ): Promise<void> {
    const tweetText = this.buildLeaderboardTweetText(players, "NA");
    const html = HtmlService.buildComponentHtml(LpLeaderboard, {
      players: players,
      region: "NA",
    });

    logger.info("tweeting lp leaderboard", { tweetText });

    // height formula:
    // 1. first calculate desired_height in pixels (brute force) for LCS + LLA graphics
    // 2. then calculate 10x + y = LCS_desired_height and 8x + y = LLA_desired_height (number of rows may differ)
    // 3. then calculate x by doing -10x + LCS_desired_height = -8x + LLA_desired_height
    // 4. voila you have y and x
    const baseHeight = 300;
    const rowScale = 60;
    const height = rowScale * players.length + baseHeight;
    const width = 730;

    return ImageService.savePng(
      html,
      {
        width,
        height,
      },
      Config.NODE_ENV === "development" ? "lp-leaderboard.png" : undefined
    )
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

  public static async tweetLpGainLeaderboard(
    players: LpGainLeaderboardPlayer[]
  ): Promise<void> {
    const tweetText = this.buildLpGainLeaderboardTweetText(players, "NA");
    const html = HtmlService.buildComponentHtml(LpGainLeaderboard, {
      players,
      region: "NA",
    });

    logger.info("tweeting lp gain leaderboard", { tweetText });

    const baseHeight = 310;
    const rowScale = 70;
    const height = rowScale * players.length + baseHeight;
    const width = 875;

    return ImageService.savePng(
      html,
      { width, height },
      Config.NODE_ENV === "development" ? "lp-gain-leaderboard.png" : undefined
    )
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
    const players = [...blueTeam, ...redTeam];
    let text = players.some((p) => p.isStreaming) ? "Player streams:\n" : "";

    // try twitter username text
    for (const player of players) {
      if (!player.isStreaming) continue;
      if (player.twitchUsername) {
        text += `📺 www.twitch.tv/${player.twitchUsername}`;
      }

      if (player.twitterUsername) {
        text += ` | @${player.twitterUsername}\n`;
      } else {
        text += `\n`;
      }
    }

    if (matchData.communityChannels && matchData.communityChannels.length > 0) {
      text += `\nCommunity streams:\n`;
      for (const communityChannel of matchData.communityChannels) {
        text += `📺 www.twitch.tv/${communityChannel.twitchUsername} | @${communityChannel.twitterUsername}\n`;
      }
    }

    if (matchData.authorUrl && matchData.authorUrl !== "@jbryu99") {
      text += `\nUpdate by ${matchData.authorUrl} 👑`;
    }

    if (text.length <= 280) return text;

    // try again with more succinct text
    text = players.some((p) => p.isStreaming) ? "Player streams:\n" : "";
    for (const player of [...blueTeam, ...redTeam]) {
      if (!player.isStreaming) continue;
      if (player.twitchUsername) {
        text += `📺 www.twitch.tv/${player.twitchUsername}\n`;
      }
    }

    if (matchData.communityChannels) {
      text += `\nCommunity streams:\n`;
      for (const communityChannel of matchData.communityChannels) {
        text += `📺 www.twitch.tv/${communityChannel.twitchUsername}\n`;
      }
    }

    if (matchData.authorUrl && matchData.authorUrl !== "@jbryu99") {
      text += `\nUpdate by ${matchData.authorUrl} 👑`;
    }

    return text;
  }

  private static buildLeaderboardTweetText(
    players: LeaderboardPlayer[],
    region: Region
  ): string {
    let postText = `Preseason | Day ${ChampsQueueService.getSplitDay()} | Current Standings\n`;

    for (let i = 0; i < players.length; i++) {
      const currPlayer = players[i];
      const prevPlayer = players[i - 1] as LeaderboardPlayer | undefined;

      const rankText =
        currPlayer.rank === prevPlayer?.rank ? "   " : currPlayer.rank + ".";
      const suffix = currPlayer.rank === 1 ? " 👑" : "";

      if (!currPlayer.twitterUsername) {
        postText += `${rankText} ${currPlayer.summonerNameWithTeam}${suffix}\n`;
        continue;
      }

      postText += `${rankText} @${currPlayer.twitterUsername}${suffix}\n`;
    }

    const tweetText = postText.trim();

    if (Config.NODE_ENV === "development") {
      writeFileSync(
        path.join(__dirname, "../../lp-leaderboard-tweet.txt"),
        tweetText
      );
    }

    return tweetText;
  }

  private static buildLpGainLeaderboardTweetText(
    players: LpGainLeaderboardPlayer[],
    region: Region
  ): string {
    let postText = `Preseason | Day ${ChampsQueueService.getSplitDay()} | Top Climbers of the Day\n`;

    for (let i = 0; i < players.length; i++) {
      const currPlayer = players[i];
      const prevPlayer = players[i - 1] as LpGainLeaderboardPlayer | undefined;

      const rankText =
        currPlayer.lpGainRank === prevPlayer?.lpGainRank
          ? "   "
          : currPlayer.lpGainRank + ".";
      const suffix = currPlayer.lpGainRank === 1 ? " 👑" : "";

      if (!currPlayer.twitterUsername) {
        postText += `${rankText} ${currPlayer.summonerNameWithTeam}${suffix}\n`;
        continue;
      }

      postText += `${rankText} @${currPlayer.twitterUsername}${suffix}\n`;
    }

    const tweetText = postText.trim();

    if (Config.NODE_ENV === "development") {
      writeFileSync(
        path.join(__dirname, "../../lp-gain-leaderboard-tweet.txt"),
        tweetText
      );
    }

    return tweetText;
  }
}
