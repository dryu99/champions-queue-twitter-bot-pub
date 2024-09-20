import dayjs from "dayjs";
import advanced from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Server from "../server";
import TwitterService, { MatchTweetData } from "../services/twitter.service";

/**
 * CREATE MATCH DATA MANUALLY
 */
// const matchData: MatchTweetData = {
//   authorUrl: "www.twitch.tv/PhreakStream",
//   region: "NA",
//   match: {
//     blueTeam: [
//       {
//         isStreaming: true,
//         summonerNameWithTeam: "FLY Bwipo",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//         twitchUsername: "faker",
//         twitterUsername: "faker",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//         twitchUsername: "faker",
//         twitterUsername: "faker",
//       },
//     ],
//     redTeam: [
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//         twitchUsername: "faker",
//         twitterUsername: "faker",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//         twitchUsername: "faker",
//         twitterUsername: "faker",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//         twitchUsername: "faker",
//         twitterUsername: "faker",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//         twitchUsername: "faker",
//         twitterUsername: "faker",
//       },
//       {
//         isStreaming: false,
//         summonerNameWithTeam: "FLY Bwipo",
//         twitchUsername: "faker",
//         twitterUsername: "faker",
//       },
//     ],
//   },
// };

/**
 * CREATE MATCH DATA VIA MESSAGE
 */
const message = `100 Sniper / 100 River / 100 Quid / 100 Tomo / 100 Eyla | vs. | Odoamne / Lyncas / Vladi / Carzzy / Trymbi`;
const match = Server.parseMatchMessage(message);

const matchData: MatchTweetData = {
  match,
  authorUrl: "@jbryu99",
  communityChannels: [
    {
      twitterUsername: "CodySun",
      twitchUsername: "codysun",
    },
    {
      twitterUsername: "faker",
      twitchUsername: "fff",
    },
    {
      twitterUsername: "Meteos",
      twitchUsername: "meteotoes",
    },
  ],
  region: "NA",
};

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);
dayjs.tz.setDefault("America/Los_Angeles");

TwitterService.init();
TwitterService.tweetMatch(matchData);
