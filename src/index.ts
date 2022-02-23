import dotenv from "dotenv";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import fs from "fs";
import path from "path";
import { ChatClient, PrivateMessage } from "@twurple/chat";
import { Match } from "./types";
import TwitchService, { chatClient } from "./services/twitch.service";

dotenv.config();

const TWITCH_URL_BASE = "https://www.twitch.tv/";
const MAX_CHANNELS = 50;
const CQ_GAME_VERSION = "12.3";

(async () => {
  console.log("connecting to chat client");
  await chatClient.connect();

  let channels = ["dhoklalol", "shenyi0521", "lourlo"];
  const livePendingChannels = [];

  chatClient.onMessage(
    async (
      channel: string,
      user: string,
      msg: string,
      privateMsg: PrivateMessage
    ) => {
      console.log({ channel, user, msg, privateMsg });
    }
  );

  setInterval(async () => {
    console.log("interval start", { channels });

    const channelsCopy = [...channels];

    for (const channel of channelsCopy) {
      if (!(await TwitchService.isStreamLive(channel))) continue;

      chatClient
        .join(channel)
        .then(() => {
          livePendingChannels.push(channel);

          // update main array
          channels = channels.filter((c) => c !== channel);
        })
        .catch((err) => console.error("failed to join channel", err));
    }

    // TODO do another check here to see if we can move items from live pending channels
  }, 60 * 1000);

  const playerCacheMap = {};

  const parseMatchMessage = (message: string): Match => {
    const teams = message.split("| vs. |");
    const blueTeam = teams[0]
      .split("/")
      .map((summonerName) => summonerName.trim());

    const redTeam = teams[1]
      .split("/")
      .map((summonerName) => summonerName.trim());

    console.log({ blueTeam, redTeam });

    return {
      blueTeam,
      redTeam,
    };
  };
})();

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
