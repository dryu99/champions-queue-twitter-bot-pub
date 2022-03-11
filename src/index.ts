import { PrivateMessage } from "@twurple/chat";
import { Match } from "./types";
import TwitchService from "./services/twitch.service";
import mongoose from "mongoose";
import Config from "./utils/config";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitterService, { MatchTweetData } from "./services/twitter.service";
import Server from "./server";
import { createLogger } from "@d-fischer/logger/lib";
import logger from "./utils/logger";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";

const TWITCH_URL_BASE = "https://www.twitch.tv/";
const MAX_CHANNELS = 50;
const CQ_GAME_VERSION = "12.3";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Los_Angeles");

Server.start().catch((error) => {
  logger.error("something went wrong in the server", error);
  process.exit(1);
});

// const matchData: MatchTweetData = {
//   match: {
//     blueTeam: [
//       { summonerNameWithTeam: "a", isStreaming: false, twitchUsername: "a" },
//       { summonerNameWithTeam: "b", isStreaming: false, twitchUsername: "b" },
//       { summonerNameWithTeam: "c", isStreaming: false, twitchUsername: "c" },
//       { summonerNameWithTeam: "d", isStreaming: false, twitchUsername: "d" },
//       { summonerNameWithTeam: "e", isStreaming: false, twitchUsername: "e" },
//       { summonerNameWithTeam: "f", isStreaming: false, twitchUsername: "f" },
//     ],
//     redTeam: [
//       {
//         summonerNameWithTeam: "FLY a",
//         isStreaming: true,
//         twitchUsername: "flyaaa",
//       },
//       {
//         summonerNameWithTeam: "FLY b",
//         isStreaming: false,
//         twitchUsername: "FLY b",
//       },
//       {
//         summonerNameWithTeam: "FLY c",
//         isStreaming: false,
//         twitchUsername: "FLY c",
//       },
//       {
//         summonerNameWithTeam: "FLY d",
//         isStreaming: false,
//         twitchUsername: "FLY d",
//       },
//       {
//         summonerNameWithTeam: "FLY e",
//         isStreaming: false,
//         twitchUsername: "FLY e",
//       },
//       {
//         summonerNameWithTeam: "FLY f",
//         isStreaming: false,
//         twitchUsername: "FLY f",
//       },
//     ],
//   },
//   author: "testuser",
// };

// setup
// - store all player metadata in db (player metadata should be updated periodically as new players join queue)
//   - twitch handle
//   - summoner name
//

// workflow
// - listen to MAX_CHANNELS channels that are (LIVE + playing league of legends)
//   - periodically try listening to unlive channels to see if they're live
// - send !teams msg periodically to every channel
// - check nightbot response
//   - if response is valid AND is not same as cached response, new game has started
//     - we can post to twitter
//     - update cached response
//     - stop listening to channels for all players mentioned in response
//     - start listening to other channels
//   - if response is valid AND same as cached response
//     - do nothing
//   - if response is not valid, do nothing + keep listening

//
/**
 * method 1 (send !teams command and listen to nightbot response)
 * pros: don't have to listen to streams infinitely
 * cons: not a good way to validate !teams response (besides adding metadata to msg)
 *
 * - get all channels (from db)
 * - every x minutes, check each channel to see if they're live
 *   - if they are add them to liveChannels list
 *   - if they aren't, remove them from liveChannels list (if they are)
 * - every y minutes, for each live channel
 *   - listen to liveChannel messages
 *   - send '!teams' message
 *   - wait for nightbot response
 */

//
/**
 * method 2 (listen to all channels for mod msg)
 * pros: don't have to worry about outdated msgs + can work with people who don't have nightbot
 * cons: have to listen to streams for longer
 *
 * - get all channels (from db)
 * - every x minutes, check each channel to see if they're live + playing league
 *   - if they are add them to liveChannels list
 *   - if they aren't, remove them from liveChannels list (if they are)
 * - for each live channel (periodically update this list)
 *   - listen to messages
 *   - wait for mod message to set !teams command
 *   - when mod message arrives,
 *     - stop listening to channel
 *     - add to pendingChannels (should also contain timestamp of when pendingChannels was added)
 *     - post tweet!
 * - every y minutes check pendingChannels, if 20 min has passed since added, add back to list
 */

// const channels = [];
// const pendingChannels = [];
// const liveChannels = [];
// const ongoingGameChannels = [];
