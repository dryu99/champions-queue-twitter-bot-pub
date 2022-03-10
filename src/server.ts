import { PrivateMessage } from "@twurple/chat/lib";
import mongoose from "mongoose";
import Config from "./utils/config";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService from "./services/twitter.service";
import { Match, MatchPlayer, SummonerNameWithTeam } from "./types";
import logger from "./utils/logger";

type TwitchUsername = string;
type LowerCaseSummonerNameWithTeam = string;

export default class Server {
  private static playerData: Map<TwitchUsername, TwitchPlayer> = new Map();
  private static nameMap: Map<LowerCaseSummonerNameWithTeam, TwitchUsername> =
    new Map();
  private static listeningChannels: Set<TwitchUsername> = new Set();
  // private static pendingChannels: Set<TwitchUsername> = new Set(); // channels that aren't being listened to
  // private static ongoingChannels: Set<{twitchUsername: TwitchUsername, startTime: number}> = new Set(); TODO stretch goal, if stream count starts getting too high

  public static async start() {
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
          // check mod here to avoid overhead
          // TODO have to check if sender is mod
          // const isUserMod = await twitchService.isUserMod(channel, user);

          // if (!isUserMod) {
          //   console.log()
          //   return
          // }

          logger.info("received new match message", { channel, user, msg });

          // parse message to match object
          const match = this.parseMatchMessage(msg);

          // flag live streamers

          try {
            if (await TwitterService.isMatchTweeted(match)) {
              logger.warn("match has already been tweeted", { match });
            } else {
              // TODO we could avoid this network call by doing inMatch checks in-memory (won't be perfect solution but would help)
              await TwitterService.tweetMatch(match);
            }
          } catch (error) {
            logger.error(
              "failed to tweet, server will keep listening to channel and try again",
              { error, channel, msg }
            );
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
        }
      }
    );

    // setup pending channel interval check
    setInterval(async () => {
      logger.info("START checking pending channels", {
        allChannels: this.playerData.size,
        listeningChannels: Array.from(this.listeningChannels),
      });

      // const pendingChannelsList = Array.from(this.pendingChannels); // need copy because we remove item from list in loop

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
        listeningChannels: Array.from(this.listeningChannels),
      });

      // TODO what happens when streamer goes offline then online?
    }, 30 * 1000); // TODO shoudl prob be 5 minutes
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

  // e.g. format: !editcom !teams Lourlo / TL Armao / GG ry0ma / EG Kaori / TSM Shenyi | vs. | TL Bwipo / DNHA Svmmy / BOG rjs / CLG Luger / EST Mia
  private static parseMatchMessage(message: string): Match {
    const messageParts = message.split("!editcom !teams");
    const commandInput = messageParts[1];

    if (!commandInput) {
      throw new Error("match message formatted incorrectly: " + message);
    }

    const teams = commandInput.split("| vs. |");
    if (teams.length !== 2) {
      throw new Error("match message formatted incorrectly: " + message);
    }
    // TODO have to validate more (team length, summonernamewithteam forma, whether they exist in db (can prob fetch before hand))

    const blueTeamNames = teams[0]
      .split("/")
      .map((summonerName) => summonerName.trim());

    const redTeamNames = teams[1]
      .split("/")
      .map((summonerName) => summonerName.trim());

    return {
      blueTeam: this.getMatchPlayers(blueTeamNames),
      redTeam: this.getMatchPlayers(redTeamNames),
    };
  }

  private static getMatchPlayers(
    summonerNamesWithTeams: string[]
  ): MatchPlayer[] {
    return summonerNamesWithTeams.map((name) => {
      const twitchUsername = this.nameMap.get(name.toLowerCase());

      if (!twitchUsername) {
        logger.warn("parsing match, name doesn't exist", { name });
        return {
          summonerNameWithTeam: name,
          isStreaming: false,
          twitchUsername: "🤖",
        };
      }

      const player = this.playerData.get(twitchUsername);
      if (!player) {
        logger.warn("parsing match, player doesn't exist", { name });
        return {
          summonerNameWithTeam: name,
          isStreaming: false,
          twitchUsername: "🤖",
        };
      }

      return {
        summonerNameWithTeam: name,
        isStreaming: player.isStreaming,
        twitchUsername: player.twitchUsername,
      };
    });
  }
}
