import { TwitterApi, TwitterApiReadWrite } from "twitter-api-v2";
import { Match } from "../types";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY as string,
  appSecret: process.env.TWITTER_API_KEY_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
}).readWrite;

export default class TwitterService {
  private static instance?: TwitterService;
  private twitterClient: TwitterApiReadWrite;

  public static getInstance() {
    if (!TwitterService.instance) {
      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY as string,
        appSecret: process.env.TWITTER_API_KEY_SECRET as string,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      }).readWrite;

      console.log("connected to twitter");

      TwitterService.instance = new TwitterService(twitterClient);
    }

    return TwitterService.instance;
  }

  constructor(twitterClient: TwitterApiReadWrite) {
    this.twitterClient = twitterClient;
  }

  public tweetLiveMatch(match: any): Promise<void> {
    const tweetText = this.parseMatchTweetText(match);
    console.log("uploading tweet", { tweetText });

    return twitterClient.v2
      .tweet(tweetText)
      .then(() => {
        console.log("tweet successfully created");
      })
      .catch((err) => {
        console.error("something went wrong", err);
      });
  }

  // TODO how to include streaming players? can prob check the playermap (add an isLive field)
  private parseMatchTweetText(match: Match): string {
    let text = "";

    text += `TOP ${match.blueTeam[0]}\n`;
    text += `JGL ${match.blueTeam[1]}\n`;
    text += `MID ${match.blueTeam[2]}\n`;
    text += `BOT ${match.blueTeam[3]}\n`;
    text += `SUP ${match.blueTeam[4]}\n\n`;

    text += "vs\n\n";

    text += `TOP ${match.redTeam[0]}\n`;
    text += `JGL ${match.redTeam[1]}\n`;
    text += `MID ${match.redTeam[2]}\n`;
    text += `BOT ${match.redTeam[3]}\n`;
    text += `SUP ${match.redTeam[4]}`;

    return text;
  }
}
