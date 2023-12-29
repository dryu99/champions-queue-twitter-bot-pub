import { Client, Events, GatewayIntentBits } from "discord.js";
import mongoose from "mongoose";
import { parseSummonerName } from "./lib/summoner-name";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService, { MatchTweetData } from "./services/twitter.service";
import { Region } from "./types";
import Config from "./utils/config";
import logger from "./utils/logger";

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

      const twitterMatch = this.toTwitterMatch(discordMatch);
      TwitterService.tweetMatch(twitterMatch);
    });

    // Log in to Discord with your client's token
    this.client.login(Config.DISCORD_API_TOKEN);
  }

  private static toTwitterMatch(discordMatch: DiscordMatch): MatchTweetData {
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

    return {
      region: "NA",
      match: {
        blueTeam: blueTeam.map((discordPlayer) =>
          this.toTwitterPlayer(discordPlayer)
        ),
        redTeam: redTeam.map((discordPlayer) =>
          this.toTwitterPlayer(discordPlayer)
        ),
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
}
