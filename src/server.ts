import mongoose from "mongoose";
import Config from "./utils/config";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService, { MatchTweetData } from "./services/twitter.service";
import {
  LowerCaseSummonerNameWithTeam,
  Match,
  MatchPlayer,
  SummonerNameWithTeam,
  TwitchUsername,
} from "./types";
import logger, { waitForLoggerToComplete } from "./utils/logger";
import { wait } from "./utils/wait";
import ChampsQueueService from "./services/champs-queue.service";
import BugService from "./services/bug.service";
import MatchService from "./services/match.service";

export default class Server {
  private static twitchPlayerData: Map<TwitchUsername, TwitchPlayer> =
    new Map(); // only contains players with twitch channels
  private static playerLcNameMap: Map<
    string, // lc summoner name (no team)
    TwitchUsername | undefined
  > = new Map(); // contains name mappings for ALL players (if no twitch channel, val is undefined)
  private static listeningChannels: Set<TwitchUsername> = new Set();
  private static matchService = new MatchService();
  // private static pendingChannels: Set<TwitchUsername> = new Set(); // channels that aren't being listened to
  // private static ongoingChannels: Set<{twitchUsername: TwitchUsername, startTime: number}> = new Set(); TODO stretch goal, if stream count starts getting too high
  private static readonly TWITCH_CHANNEL_CHECK_INTERVAL_MINUTES = 1.5;

  public static async start() {
    logger.info("starting server");

    if (!ChampsQueueService.isQueueLive()) {
      await this.stop();
    }

    try {
      await this.connectToServices();
      await this.initCache();
    } catch (error) {
      console.error("error in server initialization", error);
    }

    // setup channel message listener
    TwitchService.chatClient.onMessage(
      async (channel: string, user: string, msg: string) => {
        // check for keywords
        if (!msg.includes("!editcom !teams") && !msg.includes("| vs. |")) {
          return;
        }

        logger.info("received new match message", { channel, user, msg });

        try {
          // check mod status
          const isUserMod = await TwitchService.isUserMod(channel, user);
          if (!isUserMod) {
            logger.warn("user is not a mod, not tweeting", {
              channel,
              user,
              msg,
            });
            return;
          }

          BugService.captureMessage(
            `user sent a live match update command: ${JSON.stringify({
              channel,
              user,
              msg,
            })}`
          );

          const specialMod = TwitchService.getSpecialMod(user);
          const authorUrl = specialMod?.twitterUsername
            ? `@${specialMod?.twitterUsername}`
            : `www.twitch.tv/${user}`;

          // parse match
          let matchData: MatchTweetData | undefined;
          if (msg.includes("!editcom !teams")) {
            const commandInput = this.parseEditCommandMessage(msg);
            const match = this.parseMatchMessage(commandInput);

            matchData = { match, authorUrl };
          } else if (msg.includes("| vs. |")) {
            // msg didn't contain !editcom !teams but is still a game update msg (for winters ward lol)
            const match = this.parseMatchMessage(msg);
            matchData = { match, authorUrl };
          }

          if (!matchData) {
            logger.error("match data doesn't exist, this should never print");
            return;
          }

          await this.tweetMatch(matchData);
        } catch (error) {
          logger.error("something went wrong while parsing chat: ", error);
          BugService.captureException(error);
        }
      }
    );

    // hash clear interval
    setInterval(() => {
      logger.info("START Dequeueing hash", {
        matchHashesSize: this.matchService.getMatchHashesSize(),
      });
      this.matchService.dequeueHash();
      logger.info("END Dequeueing hash", {
        matchHashesSize: this.matchService.getMatchHashesSize(),
      });
    }, 45 * 60 * 1000);

    // check channels interval (we use while here instead of setInterval to have more async control)
    while (true) {
      if (!ChampsQueueService.isQueueLive()) {
        await this.stop();
      }

      logger.info("START checking pending channels", {
        allChannels: this.twitchPlayerData.size,
        listeningChannelCount: this.listeningChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
        matchHashesSize: this.matchService.getMatchHashesSize(),
      });

      // TODO should break up batches into groups of 100 (will reduce duplication)
      const channels = Array.from(this.twitchPlayerData.keys());
      const midIndex = Math.floor(channels.length / 2);
      const channelBatch1 = channels.slice(0, midIndex);
      const channelBatch2 = channels.slice(midIndex);

      await this.checkLiveChannels(channelBatch1);
      logger.info("finished checking batch 1", {
        batchSize: channelBatch1.length,
        listeningChannelCount: this.listeningChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
      });

      // wait x min (to avoid rate limit)
      await wait(this.TWITCH_CHANNEL_CHECK_INTERVAL_MINUTES * 60 * 1000);

      await this.checkLiveChannels(channelBatch2);
      logger.info("finished checking batch 2", {
        batchSize: channelBatch2.length,
        listeningChannelCount: this.listeningChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
        matchHashesSize: this.matchService.getMatchHashesSize(),
      });

      await wait(this.TWITCH_CHANNEL_CHECK_INTERVAL_MINUTES * 60 * 1000);
    }
  }

  public static async stop() {
    logger.info("stopping server");
    await mongoose.disconnect();
    logger.info("disconnected from db");
    await waitForLoggerToComplete(logger);
    process.exit(0);
  }

  // has side effects
  private static async checkLiveChannels(channels: string[]) {
    const checkChannelPromises: Promise<void>[] = [];
    for (const channel of channels) {
      // this promise updates channel list states if the channel is live
      const checkChannelPromise = TwitchService.isChannelLive(channel)
        .then((isChannelLive) => {
          const player = this.twitchPlayerData.get(channel)!;
          if (!isChannelLive) {
            // toggle live flag
            player.isStreaming = false;

            // stop listening to channel
            TwitchService.chatClient.part(channel);
            this.listeningChannels.delete(channel);
            return;
          }

          // toggle live flag
          player.isStreaming = true;

          // listen to channel
          return TwitchService.chatClient.join(channel).then(() => {
            this.listeningChannels.add(channel);
            // this.pendingChannels.delete(channel);
          });
        })
        .catch((err) => console.error("failed to join channel", err));

      checkChannelPromises.push(checkChannelPromise);
    }

    return Promise.allSettled(checkChannelPromises);
  }

  private static async initCache() {
    const twitchPlayers = await PlayerService.getAllTwitch();

    // init player data map
    this.twitchPlayerData = twitchPlayers.reduce((map, currPlayer) => {
      if (currPlayer.twitchUsername) {
        map.set(currPlayer.twitchUsername, currPlayer);
      }
      return map;
    }, new Map<TwitchUsername, TwitchPlayer>());

    // init name map
    this.playerLcNameMap = twitchPlayers.reduce((map, currPlayer) => {
      map.set(currPlayer.summonerName.toLowerCase(), currPlayer.twitchUsername);
      return map;
    }, new Map<SummonerNameWithTeam, TwitchUsername | undefined>());

    logger.info("cache state", {
      twitchPlayerData: this.twitchPlayerData.entries(),
      playerLcNameMap: this.playerLcNameMap.entries(),
    });

    // special exceptions lol
    this.playerLcNameMap.set("gg pridestalker", "pridestalkerrlol");

    // init pending channels list
    // this.pendingChannels = new Set(
    //   players.map((player) => player.twitchUsername)
    // ); // TODO how to include casters here?
  }

  private static async connectToServices() {
    await TwitchService.init();
    TwitterService.init();
    await mongoose.connect(Config.ATLAS_URL);
    logger.info("connected to db");
  }

  private static tweetMatch(matchData: MatchTweetData) {
    // check for match duplicates
    const matchHashData = this.matchService.calcMatchHashData(matchData.match);
    if (this.matchService.isMatchDuplicate(matchHashData)) {
      logger.warn("recent duplicate match, not tweeting", {
        user: matchData.authorUrl,
      });
      // TODO maybe throw error here?
      return;
    }
    this.matchService.enqueueHash(matchHashData);

    return TwitterService.tweetMatch(matchData);
  }

  // Lourlo / TL Armao / GG ry0ma / EG Kaori / TSM Shenyi | vs. | TL Bwipo / DNHA Svmmy / BOG rjs / CLG Luger / EST Mia
  private static parseMatchMessage(message: string): Match {
    const teams = message.split("| vs. |");
    if (teams.length !== 2) {
      throw new Error(
        "parseMatchMessage message formatted incorrectly: " + message
      );
    }

    const blueTeamNames = teams[0]
      .split("/")
      .map((summonerName) => summonerName.trim());

    const redTeamNames = teams[1]
      .split("/")
      .map((summonerName) => summonerName.trim());

    if (blueTeamNames.length !== 5 || redTeamNames.length !== 5) {
      throw new Error("parseMatchMessage invalid player count: " + message);
    }

    return {
      blueTeam: this.getMatchPlayers(blueTeamNames),
      redTeam: this.getMatchPlayers(redTeamNames),
    };
  }

  // !editcom !teams ...
  private static parseEditCommandMessage(message: string): string {
    const messageParts = message.split("!editcom !teams");
    const commandInput = messageParts[1];

    if (!commandInput) {
      throw new Error(
        "parseEditCommandMessage message formatted incorrectly: " + message
      );
    }

    return commandInput;
  }

  private static getMatchPlayers(
    summonerNamesWithTeams: string[]
  ): MatchPlayer[] {
    return summonerNamesWithTeams.map((summonerNameWithTeam) => {
      const summonerName = summonerNameWithTeam.split(" ").slice(1).join(" ");

      if (!this.playerLcNameMap.has(summonerName.toLowerCase())) {
        logger.warn(
          "getMatchPlayers invalid summoner name, check db if player exists",
          { summonerNameWithTeam, summonerName }
        );

        return {
          summonerNameWithTeam,
          isStreaming: false,
        };
      }

      const twitchUsername = this.playerLcNameMap.get(
        summonerName.toLowerCase()
      );
      if (!twitchUsername)
        return {
          summonerNameWithTeam,
          isStreaming: false,
        };

      const player = this.twitchPlayerData.get(twitchUsername);
      if (!player)
        return {
          summonerNameWithTeam,
          twitchUsername,
          isStreaming: false,
        };

      return {
        summonerNameWithTeam,
        twitchUsername,
        isStreaming: player.isStreaming,
      };
    });
  }
}
