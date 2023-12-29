import { Client, Events, GatewayIntentBits } from "discord.js";
import mongoose from "mongoose";
import { parseSummonerName } from "./lib/summoner-name";
import ChampsQueueService from "./services/champs-queue.service";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService, { MatchTweetData } from "./services/twitter.service";
import { Region } from "./types";
import Config from "./utils/config";
import logger from "./utils/logger";
import { wait } from "./utils/wait";

type LowerCaseSummonerName = string;

type DiscordPlayer = {
  name: string;
  position: "support" | "bot" | "top" | "mid" | "jungle";
  elo: number;
  wins: number | null;
  losses: number | null;
};

type DiscordMatch = {
  id: string;
  teams: {
    side: "Blue" | "Red";
    players: DiscordPlayer[];
  }[];
};

export class DiscordServer {
  private static client: Client;
  private static readonly MATCH_LOG_CHANNEL_ID = "1189762592831455345";
  private static playerMap = new Map<LowerCaseSummonerName, TwitchPlayer>();

  public static async start(region: Region) {
    await TwitchService.init();
    TwitterService.init();
    await mongoose.connect(Config.ATLAS_URL);

    const twitchPlayers = await PlayerService.getAllTwitch(region);
    logger.info("twitchPlayers", twitchPlayers.slice(0, 5));

    this.playerMap = twitchPlayers.reduce((map, currPlayer) => {
      map.set(currPlayer.summonerName.toLowerCase(), currPlayer);
      return map;
    }, new Map<LowerCaseSummonerName, TwitchPlayer>());

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.once(Events.ClientReady, (readyClient) => {
      logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.channel.id !== this.MATCH_LOG_CHANNEL_ID) return;
      // if (message.author.bot) return; TODO add this when we know which user is posting updates

      Config.NODE_ENV === "development" &&
        logger.info("Received message in match log channel", {
          message: message.content,
        });

      if (!message.content.includes("```json")) return;

      const matchJsonString = message.content
        .replace(/```json\n?|\n?```/g, "")
        .trim();

      const discordMatch: DiscordMatch = JSON.parse(matchJsonString);

      const twitterMatch = await this.toTwitterMatch(discordMatch);
      TwitterService.tweetMatch(twitterMatch);
    });

    // Log in to Discord with your client's token
    this.client.login(Config.DISCORD_API_TOKEN);

    // check every 30 min to see if queue is live
    while (true) {
      if (!ChampsQueueService.isQueueLive(region)) {
        await this.stop(region);
      }

      // check every 30 min
      await wait(30 * 60 * 1000);
    }
  }

  private static async toTwitterMatch(
    discordMatch: DiscordMatch
  ): Promise<MatchTweetData> {
    const { teams } = discordMatch;
    const blueTeam = teams.find((team) => team.side === "Blue")?.players ?? [];
    const redTeam = teams.find((team) => team.side === "Red")?.players ?? [];

    // sort each team according to position.
    const positionOrder = ["top", "jungle", "mid", "bot", "support"];
    blueTeam.sort(
      (a, b) =>
        positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
    );
    redTeam.sort(
      (a, b) =>
        positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
    );

    // TODO can optimize this to check all channels in parallel
    //      can also further optimize by caching channels tto avoid future checks like in twitch server
    const blueTeamTwitterPlayers = [];
    for (const player of blueTeam) {
      const twitterPlayer = this.toTwitterPlayer(player);

      if (twitterPlayer.twitchUsername) {
        const isChannelLive = await TwitchService.isChannelLive(
          twitterPlayer.twitchUsername
        );
        twitterPlayer.isStreaming = isChannelLive;
      }

      blueTeamTwitterPlayers.push(twitterPlayer);
    }

    const redTeamTwitterPlayers = [];
    for (const player of redTeam) {
      const twitterPlayer = this.toTwitterPlayer(player);

      if (twitterPlayer.twitchUsername) {
        const isChannelLive = await TwitchService.isChannelLive(
          twitterPlayer.twitchUsername
        );
        twitterPlayer.isStreaming = isChannelLive;
      }

      redTeamTwitterPlayers.push(twitterPlayer);
    }

    return {
      region: "NA",
      match: {
        blueTeam: blueTeamTwitterPlayers,
        redTeam: redTeamTwitterPlayers,
      },
    };
  }

  private static toTwitterPlayer(discordPlayer: DiscordPlayer) {
    // discord names have #eProd appended to them
    const cleanName = discordPlayer.name.split("#")[0].trim();
    const summonerName = parseSummonerName(cleanName);

    const dbPlayer = this.playerMap.get(summonerName.toLowerCase());

    return {
      summonerNameWithTeam: cleanName,
      isStreaming: false,
      twitchUsername: dbPlayer?.twitchUsername,
      twitterUsername: dbPlayer?.twitterUsername,
    };
  }

  private static async stop(region: Region) {
    logger.info("stopping server", { region });
    await mongoose.disconnect();
    logger.info("disconnected from db");
    // await waitForLoggerToComplete(logger);
    logger.info("ending");
    process.exit(0);
  }
}
