import dayjs from "dayjs";
import advanced from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import TwitterService, { MatchTweetData } from "../services/twitter.service";

const matchData: MatchTweetData = {
  authorUrl: "www.twitch.tv/PhreakStream",
  region: "NA",
  match: {
    blueTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "FLY Bwipo",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
        twitchUsername: "faker",
        twitterUsername: "faker",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
        twitchUsername: "faker",
        twitterUsername: "faker",
      },
    ],
    redTeam: [
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
        twitchUsername: "faker",
        twitterUsername: "faker",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
        twitchUsername: "faker",
        twitterUsername: "faker",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
        twitchUsername: "faker",
        twitterUsername: "faker",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
        twitchUsername: "faker",
        twitterUsername: "faker",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Bwipo",
        twitchUsername: "faker",
        twitterUsername: "faker",
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
