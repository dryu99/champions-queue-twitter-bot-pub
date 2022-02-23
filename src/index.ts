import dotenv from "dotenv";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import fs from "fs";
import path from "path";

dotenv.config();

const clientId = process.env.TWITCH_CLIENT_ID as string;
const clientSecret = process.env.TWITCH_SECRET as string;

const tokenData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "config/twitch-tokens.json"), {
    encoding: "utf-8",
  })
);

// As a minor optimization, you may pass the scopes of the token, but be sure they're correct in that case!
const authProvider = new RefreshingAuthProvider(
  {
    clientId,
    clientSecret,
    onRefresh: (newTokenData) =>
      fs.writeFileSync(
        path.resolve(__dirname, "config/twitch-tokens.json"),
        JSON.stringify(newTokenData, null, 4),
        { encoding: "utf-8" }
      ),
  },
  tokenData
);

const apiClient = new ApiClient({ authProvider });

interface Player {
  summonerName: string;
  summonerNameWithTeam: string;
  team: string;
  twitchUsername?: string;
}

type SummonerName = string;
interface Match {
  blueTeam: SummonerName[];
  redTeam: SummonerName[];
}

interface PlayerCache {
  summonerName: SummonerName;
  prevMatch?: Match;
}

const TWITCH_URL_BASE = "https://www.twitch.tv/";
const version = "12.3";

const players: Player[] = [
  {
    summonerName: "Lourlo",
    summonerNameWithTeam: "Lourlo",
    team: "",
    twitchUsername: "lourlo",
  },
  {
    summonerName: "Pobelter",
    summonerNameWithTeam: "Pobelter",
    team: "",
    twitchUsername: "pobelter",
  },
  {
    summonerName: "Doublelift",
    summonerNameWithTeam: "Doublelift",
    team: "",
    twitchUsername: "doublelift",
  },
];

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

const MAX_CHANNELS = 50;

const playersWithTwitch = players.filter((player) => !!player.twitchUsername);

// TODO how to get only live channels?
// const channels = playersWithTwitch
//   .map((player) => player.twitchUsername as string)
//   .slice(0, MAX_CHANNELS);

const channels = ["dhoklalol", "shenyi0521"];

setInterval(async () => {
  console.log("interval");

  for (const channel of channels) {
    const isLive = await isStreamLive(channel);
    console.log({ channel, isLive });
  }

  // client.send("PING", "#doublelift");
  // client.send("PING", "#lourlo");
  // channels.forEach((channel) => client.say(channel, "!teams"));
}, 30 * 1000);

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
 * pros: don't have to worry about outdated msgs
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

async function isStreamLive(userName: string) {
  const user = await apiClient.users.getUserByName(userName);
  if (!user) {
    return false;
  }
  return (await user.getStream()) !== null;
}
