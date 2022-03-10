import { PrivateMessage } from "@twurple/chat/lib";
import mongoose from "mongoose";
import Config from "./utils/config";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService from "./services/twitter.service";
import { Match, SummonerNameWithTeam } from "./types";
import logger from "./utils/logger";

type TwitchUsername = string;

export default class Server {
  private static playerData: Map<TwitchUsername, TwitchPlayer> = new Map();
  private static pendingChannels: Set<TwitchUsername> = new Set(); // channels that aren't being listened to
  private static listeningChannels: Set<TwitchUsername> = new Set();
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

          try {
            if (!(await TwitterService.isMatchTweeted(match))) {
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
          this.listeningChannels.delete(channel);
          try {
            TwitchService.chatClient.part(channel);
          } catch (error) {
            console.error("failed to stop listening to channel", {
              error,
              channel,
            });
          }
        }
      }
    );

    // setup pending channel interval check
    setInterval(async () => {
      logger.info("START checking pending channels", {
        pendingChannels: this.pendingChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
      });

      const pendingChannelsList = Array.from(this.pendingChannels); // need copy because we remove item from list in loop

      const checkChannelPromises: Promise<void>[] = [];
      for (const channel of pendingChannelsList) {
        // this promise updates channel list states if the channel is live
        const checkChannelPromise = TwitchService.isChannelLive(channel)
          .then((isChannelLive) => {
            if (!isChannelLive) return;

            return TwitchService.chatClient.join(channel).then(() => {
              this.listeningChannels.add(channel);
              this.pendingChannels.delete(channel);
            });
          })
          .catch((err) => console.error("failed to join channel", err));

        checkChannelPromises.push(checkChannelPromise);
      }

      await Promise.allSettled(checkChannelPromises);

      logger.info("END checking pending channels", {
        pendingChannels: this.pendingChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
      });

      // TODO what happens when streamer goes offline then online?
    }, 10 * 1000); // TODO shoudl prob be 5 minutes
  }

  private static async initCache() {
    const players = await PlayerService.getAllTwitch();

    this.playerData = players.reduce((map, currPlayer) => {
      map.set(currPlayer.twitchUsername, currPlayer);
      return map;
    }, new Map<TwitchUsername, TwitchPlayer>());

    this.pendingChannels = new Set(
      players.map((player) => player.twitchUsername)
    ); // TODO how to include casters here?
  }

  private static async connectToServices() {
    await TwitchService.init();
    TwitterService.init();
    await mongoose.connect(Config.ATLAS_URL);
    logger.info("connected to db");
  }

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

    const blueTeam = teams[0]
      .split("/")
      .map((summonerName) => summonerName.trim());

    const redTeam = teams[1]
      .split("/")
      .map((summonerName) => summonerName.trim());

    return {
      blueTeam,
      redTeam,
    };
  }
}
