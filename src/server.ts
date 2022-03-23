import { PrivateMessage } from "@twurple/chat/lib";
import mongoose from "mongoose";
import Config from "./utils/config";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService from "./services/twitter.service";
import {
  LowerCaseSummonerNameWithTeam,
  Match,
  MatchPlayer,
  SummonerNameWithTeam,
  TwitchUsername,
} from "./types";
import logger from "./utils/logger";
import { wait } from "./utils/wait";
import ChampsQueueService from "./services/champs-queue.service";
import BugService from "./services/bug.service";
import MatchService from "./services/match.service";

export default class Server {
  private static twitchPlayerData: Map<TwitchUsername, TwitchPlayer> =
    new Map(); // only contains players with twitch channels
  private static playerLcNameMap: Map<
    LowerCaseSummonerNameWithTeam,
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
      logger.warn("champions queue not live, stopping server");
      process.exit(0);
    }

    try {
      await this.connectToServices();
      await this.initCache();
    } catch (error) {
      console.error("error in server initialization", error);
    }

    // setup channel message listener
    TwitchService.chatClient.onMessage(
      async (
        channel: string,
        user: string,
        msg: string,
        privateMsg: PrivateMessage
      ) => {
        if (msg.includes("!editcom !teams")) {
          logger.info("received new match message", { channel, user, msg });
          BugService.captureMessage(
            `user used !editcom !teams command: ${JSON.stringify({
              channel,
              user,
              msg,
            })}`
          );

          try {
            const isUserMod = await TwitchService.isUserMod(channel, user);
            if (!isUserMod) {
              logger.warn("user is not a mod, not tweeting", {
                channel,
                user,
                msg,
              });
              return;
            }

            // parse match
            const match = this.parseMatchMessage(msg);
            const matchData = { match, author: user };

            // check for match duplicates
            const matchHashData = this.matchService.calcMatchHashData(match);
            if (this.matchService.isMatchDuplicate(matchHashData)) {
              logger.warn("recent duplicate match, not tweeting", {
                channel,
                user,
                msg,
              });
              return;
            }
            this.matchService.addHash(matchHashData);

            await TwitterService.tweetMatch(matchData);

            // add channel to ongoing channels (set timeout for 20 min)
            // this.ongoingChannels.add(channel.substring(1)); // substring to remove #

            // stop listening to channel
            // this.listeningChannels.delete(channel);
            // try {
            //   TwitchService.chatClient.part(channel);
            // } catch (error) {
            //   console.error("failed to stop listening to channel", {
            //     error,
            //     channel,
            //   });
            // }
          } catch (error) {
            logger.error("something went wrong while parsing chat: ", error);
            BugService.captureException(error);
          }
        }

        // else if (msg.includes("| vs. |")) {
        //   // TODO do this (for winters ward :^))
        // }
      }
    );

    while (true) {
      if (!ChampsQueueService.isQueueLive()) {
        logger.info("champions queue not live anymore, stopping server");
        process.exit(0);
      }

      logger.info("START checking pending channels", {
        allChannels: this.twitchPlayerData.size,
        listeningChannelCount: this.listeningChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
        matchHashSetSize: this.matchService.getMatchHashesSize(),
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
        matchHashSetSize: this.matchService.getMatchHashesSize(),
      });

      await wait(this.TWITCH_CHANNEL_CHECK_INTERVAL_MINUTES * 60 * 1000);
    }
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
      map.set(
        currPlayer.summonerNameWithTeam.toLowerCase(),
        currPlayer.twitchUsername
      );
      return map;
    }, new Map<SummonerNameWithTeam, TwitchUsername | undefined>());

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

  // !editcom !teams Lourlo / TL Armao / GG ry0ma / EG Kaori / TSM Shenyi | vs. | TL Bwipo / DNHA Svmmy / BOG rjs / CLG Luger / EST Mia
  private static parseMatchMessage(message: string): Match {
    const messageParts = message.split("!editcom !teams");
    const commandInput = messageParts[1];

    if (!commandInput) {
      throw new Error(
        "parseMatchMessage message formatted incorrectly: " + message
      );
    }

    const teams = commandInput.split("| vs. |");
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

  private static getMatchPlayers(
    summonerNamesWithTeams: string[]
  ): MatchPlayer[] {
    return summonerNamesWithTeams.map((name) => {
      if (!this.playerLcNameMap.has(name.toLowerCase())) {
        const errorMsg =
          "getMatchPlayers invalid summoner name, check db if player exists: " +
          name;
        throw new Error(errorMsg);
      }

      const twitchUsername = this.playerLcNameMap.get(name.toLowerCase());
      if (!twitchUsername)
        return {
          summonerNameWithTeam: name,
          isStreaming: false,
        };

      const player = this.twitchPlayerData.get(twitchUsername);
      if (!player)
        return {
          summonerNameWithTeam: name,
          twitchUsername,
          isStreaming: false,
        };

      return {
        summonerNameWithTeam: name,
        twitchUsername,
        isStreaming: player.isStreaming,
      };
    });
  }
}
