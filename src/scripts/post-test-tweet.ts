import TwitterService, { MatchTweetData } from "../services/twitter.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";

const matchData: MatchTweetData = {
  author: "PhreakStream",
  match: {
    blueTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "C9 jojopyun",
        twitchUsername: "jojopyun",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "C9 jojopyun",
        twitchUsername: "jojopyun",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "C9 jojopyun",
        twitchUsername: "jojopyun",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "C9 jojopyun",
        twitchUsername: "jojopyun",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "C9 jojopyun",
        twitchUsername: "jojopyun",
      },
    ],
    redTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "NRG Palafox",
        twitchUsername: "palafox",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "NRG Palafox",
        twitchUsername: "palafox",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "NRG Palafox",
        twitchUsername: "palafox",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "NRG Palafox",
        twitchUsername: "palafox",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "NRG Palafox",
        twitchUsername: "palafox",
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
