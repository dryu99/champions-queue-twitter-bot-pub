import mongoose from "mongoose";
import { parseSummonerName } from "./lib/summoner-name";
import BugService from "./services/bug.service";
import ChampsQueueService from "./services/champs-queue.service";
import MatchService from "./services/match.service";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService, { MatchTweetData } from "./services/twitter.service";
import {
  Match,
  MatchPlayer,
  Region,
  SummonerNameWithTeam,
  TwitchUsername,
} from "./types";
import Config from "./utils/config";
import logger from "./utils/logger";
import { wait } from "./utils/wait";

export default class Server {
  private static twitchPlayerData: Map<TwitchUsername, TwitchPlayer> =
    new Map(); // contains players and costreamers
  private static playerLcNameMap: Map<
    string, // lc summoner name (no team)
    TwitchUsername | undefined
  > = new Map(); // contains name mappings for ALL players (if no twitch channel, val is undefined)
  private static listeningChannels: Set<TwitchUsername> = new Set();
  private static matchService = new MatchService();
  // private static pendingChannels: Set<TwitchUsername> = new Set(); // channels that aren't being listened to
  // private static ongoingChannels: Set<{twitchUsername: TwitchUsername, startTime: number}> = new Set(); TODO stretch goal, if stream count starts getting too high
  private static readonly TWITCH_CHANNEL_CHECK_INTERVAL_MINUTES = 1;

  public static async start(region: Region) {
    logger.info("starting server");

    if (!ChampsQueueService.isQueueLive(region)) {
      await this.stop(region);
    }

    try {
      await this.connectToServices();
      await this.initCache(region);
    } catch (error) {
      console.error("error in server initialization", error);
    }

    // setup channel message listener
    TwitchService.chatClient.onMessage(
      async (channel: string, user: string, msg: string) => {
        const isValidCommand =
          (msg.includes(TwitchService.TEAM_COMMAND) ||
            msg.includes(TwitchService.CQ_COMMAND)) &&
          msg.includes(TwitchService.VS_SPLIT_MESSAGE);

        if (!isValidCommand) return;

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

          const liveCommunityChannels = TwitchService.specialChannels.filter(
            (channel) =>
              this.twitchPlayerData.get(channel.twitchUsername)?.isStreaming
          );

          logger.info("determined message data", {
            specialMod,
            authorUrl,
            communityChannels: liveCommunityChannels,
          });

          // parse match
          let matchData: MatchTweetData | undefined;
          if (msg.includes(TwitchService.TEAM_COMMAND)) {
            const commandInput = this.parseEditCommandMessage(
              msg,
              TwitchService.TEAM_COMMAND
            );
            const match = this.parseMatchMessage(commandInput);

            matchData = {
              match,
              authorUrl,
              communityChannels: liveCommunityChannels,
              region,
            };
          } else if (msg.includes(TwitchService.CQ_COMMAND)) {
            const commandInput = this.parseEditCommandMessage(
              msg,
              TwitchService.CQ_COMMAND
            );
            const match = this.parseMatchMessage(commandInput);

            matchData = {
              match,
              authorUrl,
              communityChannels: liveCommunityChannels,
              region,
            };
          } else if (msg.includes(TwitchService.VS_SPLIT_MESSAGE)) {
            // msg didn't contain !editcom !teams but is still a game update msg (for winters ward lol)
            const match = this.parseMatchMessage(msg);
            matchData = {
              match,
              authorUrl,
              communityChannels: liveCommunityChannels,
              region,
            };
          }

          if (!matchData) {
            logger.error("match data doesn't exist, this should never print");
            return;
          }

          this.tweetMatch(matchData);
        } catch (error) {
          logger.error("something went wrong while parsing chat: ", error);
          BugService.captureException(error);
        }
      }
    );

    // hash is used to prevent duplicate posts from being tweeted
    // we dequeue hashes every 45 min i.e. avg game time
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
      if (!ChampsQueueService.isQueueLive(region)) {
        await this.stop(region);
      }

      logger.info("START checking pending channels", {
        allChannels: this.twitchPlayerData.size,
        listeningChannelCount: this.listeningChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
        matchHashesSize: this.matchService.getMatchHashesSize(),
      });

      // TODO should break up batches into groups of 100 (will reduce duplication)
      const channels = TwitchService.specialChannels
        .map((channel) => channel.twitchUsername)
        .concat(Array.from(this.twitchPlayerData.keys()));

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

  public static async stop(region: Region) {
    logger.info("stopping server", { region });
    await mongoose.disconnect();
    logger.info("disconnected from db");
    // await waitForLoggerToComplete(logger);
    logger.info("ending");
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
            // stop listening to channel
            player.isStreaming = false;
            TwitchService.chatClient.part(channel);
            this.listeningChannels.delete(channel);
            return;
          }

          // listen to channel
          player.isStreaming = true;
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

  private static async initCache(region: Region) {
    const twitchPlayers = await PlayerService.getAllTwitch(region);
    logger.info("twitchPlayers", twitchPlayers.slice(0, 5));

    // we want to track both players and costreamers here
    const allPlayers = twitchPlayers.concat(
      TwitchService.specialChannels.map((channel) => ({
        summonerNameWithTeam: channel.twitterUsername,
        summonerName: channel.twitterUsername,
        twitchUsername: channel.twitchUsername,
        twitterUsername: channel.twitterUsername,
        isStreaming: false,
      }))
    );

    // init player data map
    this.twitchPlayerData = allPlayers.reduce((map, currPlayer) => {
      if (currPlayer.twitchUsername) {
        map.set(currPlayer.twitchUsername, currPlayer);
      }
      return map;
    }, new Map<TwitchUsername, TwitchPlayer>());

    // init name map (note that we call twitch players here)
    this.playerLcNameMap = twitchPlayers.reduce((map, currPlayer) => {
      map.set(currPlayer.summonerName.toLowerCase(), currPlayer.twitchUsername);
      return map;
    }, new Map<SummonerNameWithTeam, TwitchUsername | undefined>());

    logger.info("cache state", {
      twitchPlayerData: Array.from(this.twitchPlayerData.entries()).slice(0, 5),
      playerLcNameMap: Array.from(this.playerLcNameMap.entries()).slice(0, 5),
    });

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
  public static parseMatchMessage(message: string): Match {
    const teams = message.split(TwitchService.VS_SPLIT_MESSAGE);
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
  private static parseEditCommandMessage(
    message: string,
    splitText: string
  ): string {
    const messageParts = message.split(splitText);
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
      // we do this since playerLcName cache doesnt contain teams. have to extract only the summonername somehow
      const summonerName = parseSummonerName(summonerNameWithTeam);

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
      if (!twitchUsername) {
        logger.info("getMatchPlayers no twitch username", {
          summonerNameWithTeam,
        });
        return {
          summonerNameWithTeam,
          isStreaming: false,
        };
      }

      const player = this.twitchPlayerData.get(twitchUsername);
      logger.info("getMatchPlayers player", { player });
      if (!player) {
        return {
          summonerNameWithTeam,
          twitchUsername,
          isStreaming: false,
        };
      }

      return {
        summonerNameWithTeam,
        twitchUsername,
        twitterUsername: player.twitterUsername,
        isStreaming: player.isStreaming,
      };
    });
  }
}
