import irc from "irc";
import tmi from "tmi.js";
import dotenv from "dotenv";

dotenv.config();

const serverName = "irc.chat.twitch.tv";
const username = process.env.TWITCH_USERNAME;
const token = process.env.TWITCH_OAUTH_TOKEN;

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
const channels = playersWithTwitch
  .map((player) => `#${player.twitchUsername}`)
  .slice(0, MAX_CHANNELS);

const client = new irc.Client(serverName, nickname, {
  channels: ["#doublelift", "#lourlo"],
  password: token,
});

client.addListener("message", (from: string, to: string, message: string) => {
  if (message.includes("PING")) {
    console.log(from + " => " + to + ": " + message);
  }

  if (from === "nightbot" && message.includes("vs.")) {
    // TODO make this more robust
    const match = parseMatchMessage(message);
    console.log({ match });
  }
});

client.addListener("error", (message) => {
  console.error("error: ", message);
});

setInterval(() => {
  console.log("interval");
  client.send("PING", "#doublelift");
  client.send("PING", "#lourlo");
  // channels.forEach((channel) => client.say(channel, "!teams"));
}, 5 * 1000);

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
