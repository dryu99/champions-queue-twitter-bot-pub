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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { wait } from "./utils/wait";

export default class Server {
  private static playerData: Map<TwitchUsername, TwitchPlayer> = new Map();
  private static nameMap: Map<LowerCaseSummonerNameWithTeam, TwitchUsername> =
    new Map();
  private static listeningChannels: Set<TwitchUsername> = new Set();
  // private static pendingChannels: Set<TwitchUsername> = new Set(); // channels that aren't being listened to
  // private static ongoingChannels: Set<{twitchUsername: TwitchUsername, startTime: number}> = new Set(); TODO stretch goal, if stream count starts getting too high
  private static readonly SERVER_MIN_START_HOUR = 9; // mondays we start @ 10am
  private static readonly SERVER_END_HOUR = 2;
  private static readonly TWITCH_CHANNEL_CHECK_INTERVAL_MINUTES = 5;

  public static async start() {
    logger.info("starting server");
    try {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.tz.setDefault("America/Los_Angeles");

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

            const match = this.parseMatchMessage(msg);
            const matchData = { match, author: user };

            if (await TwitterService.isMatchTweeted(matchData)) {
              logger.warn("match has already been tweeted", { match });
            } else {
              // TODO we could avoid this network call by doing inMatch checks in-memory (won't be perfect solution but would help)
              await TwitterService.tweetMatch(matchData);
            }

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
            logger.error("something went wrong while parsing chat", {
              error,
              channel,
              msg,
            });
          }
        }
      }
    );

    while (true) {
      // server shouldn't run between 2am-9am
      const currDate = dayjs().tz();
      if (
        currDate.hour() >= this.SERVER_END_HOUR &&
        currDate.hour() <= this.SERVER_MIN_START_HOUR
      ) {
        logger.info("champions queue block has ended, stopping server", {
          date: currDate.toDate().toLocaleString(),
        });
        process.exit(0);
      }

      logger.info("START checking pending channels", {
        allChannels: this.playerData.size,
        listeningChannelCount: this.listeningChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
      });

      // const pendingChannelsList = Array.from(this.pendingChannels); // need copy because we remove item from list in loop

      // check each channel to see if it's live
      const checkChannelPromises: Promise<void>[] = [];
      for (const channel of Array.from(this.playerData.keys())) {
        // this promise updates channel list states if the channel is live
        const checkChannelPromise = TwitchService.isChannelLive(channel)
          .then((isChannelLive) => {
            if (!isChannelLive) {
              // toggle live flag
              const player = this.playerData.get(channel)!;
              player.isStreaming = false;

              // stop listening to channel
              TwitchService.chatClient.part(channel);
              this.listeningChannels.delete(channel);
              return;
            }

            // toggle live flag
            const player = this.playerData.get(channel)!;
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

      await Promise.allSettled(checkChannelPromises);

      logger.info("END checking pending channels", {
        allChannels: this.playerData.size,
        listeningChannelCount: this.listeningChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
      });

      await wait(this.TWITCH_CHANNEL_CHECK_INTERVAL_MINUTES * 60 * 1000);
    }
  }

  private static async initCache() {
    const players = await PlayerService.getAllTwitch();

    // init player data map
    this.playerData = players.reduce((map, currPlayer) => {
      map.set(currPlayer.twitchUsername, currPlayer);
      return map;
    }, new Map<TwitchUsername, TwitchPlayer>());

    // init name map
    this.nameMap = players.reduce((map, currPlayer) => {
      map.set(
        currPlayer.summonerNameWithTeam.toLowerCase(),
        currPlayer.twitchUsername
      );
      return map;
    }, new Map<SummonerNameWithTeam, TwitchUsername>());

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
      if (!this.nameMap.has(name.toLowerCase())) {
        throw new Error(
          "getMatchPlayers invalid summoner name, check db if player exists: " +
            name
        );
      }

      const twitchUsername = this.nameMap.get(name.toLowerCase())!; // has to exist b/c of prev check
      const player = this.playerData.get(twitchUsername)!; // has to exist since nameMap and playerData built from same data source

      return {
        summonerNameWithTeam: name,
        isStreaming: player.isStreaming,
        twitchUsername: player.twitchUsername,
      };
    });
  }
}
