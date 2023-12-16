import TwitterService, { MatchTweetData } from "../services/twitter.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";

const matchData: MatchTweetData = {
  authorUrl: "www.twitch.tv/PhreakStream",
  region: "NA",
  match: {
    blueTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "SR jojopyun",
        twitchUsername: "jojopyun",
        twitterUsername: "jojolol",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "FEAR jojopy",
        twitchUsername: "jojopyun",
        twitterUsername: "jojolol",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "LIT jojopn",
        twitchUsername: "jojopyun",
        twitterUsername: "jojolol",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "C9 joyun",
        twitchUsername: "jojopyun",
        twitterUsername: "jojolol",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "C9 jojon",
        twitchUsername: "jojopyun",
        twitterUsername: "jojolol",
      },
    ],
    redTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "NRG Paafox",
        twitchUsername: "palafox",
        twitterUsername: "palafox",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "SR Palox",
        twitchUsername: "palafox",
        twitterUsername: "palafox",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "NRG Pfox",
        twitchUsername: "palafox",
        twitterUsername: "palafox",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "NRG P",
        twitchUsername: "palafox",
        twitterUsername: "palafox",
      },
      {
        isStreaming: true,
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
