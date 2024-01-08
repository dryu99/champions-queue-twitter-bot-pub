import dayjs from "dayjs";
import advanced from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import TwitterService, { MatchTweetData } from "../services/twitter.service";

const matchData: MatchTweetData = {
  authorUrl: "www.twitch.tv/PhreakStream",
  region: "EU",
  match: {
    blueTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "6K Jankos",
        twitchUsername: "jankos",
        twitterUsername: "JankosLoL",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "TH Jankos",
        twitchUsername: "jankos",
        twitterUsername: "JankosLoL",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "TH Jankos",
        twitchUsername: "jankos",
        twitterUsername: "JankosLoL",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "TH Jankos",
        twitchUsername: "jankos",
        twitterUsername: "JankosLoL",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "TH Jankos",
        twitchUsername: "jankos",
        twitterUsername: "JankosLoL",
      },
    ],
    redTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "Bo",
        twitchUsername: "zyblol",
        twitterUsername: "zyblol",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "Bo",
        twitchUsername: "zyblol",
        twitterUsername: "zyblol",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "Bo",
        twitchUsername: "zyblol",
        twitterUsername: "zyblol",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "Bo",
        twitchUsername: "zyblol",
        twitterUsername: "zyblol",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "Bo",
        twitchUsername: "zyblol",
        twitterUsername: "zyblol",
      },
    ],
  },
};

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);
dayjs.tz.setDefault("America/Los_Angeles");

TwitterService.init();
TwitterService.tweetMatch(matchData);
