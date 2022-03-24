import TwitterService, { MatchTweetData } from "../services/twitter.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";

const matchData: MatchTweetData = {
  author: "testuser",
  match: {
    blueTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "CLG Dhokla",
        twitchUsername: "dhoklalol",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "CLG RoseThorn",
        twitchUsername: "rosethornlol",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "WCA Crazy Goose",
        twitchUsername: "thepowerofevil",
      },
      { isStreaming: false, summonerNameWithTeam: "Keith" },
      {
        isStreaming: false,
        summonerNameWithTeam: "C9 Isles",
        twitchUsername: "islesworld",
      },
    ],
    redTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "Pobelter",
        twitchUsername: "pobelter",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY josedeodo",
        twitchUsername: "josedeodo",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Toucouille",
        twitchUsername: "toucouille_lol",
      },
      { isStreaming: false, summonerNameWithTeam: "EST Bvoy" },
      { isStreaming: false, summonerNameWithTeam: "EST Mia" },
    ],
  },
};

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);
dayjs.tz.setDefault("America/Los_Angeles");

TwitterService.init();
TwitterService.tweetMatch(matchData);
