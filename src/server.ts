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
  private static pendingChannels: Set<TwitchUsername> = new Set();
  private static listeningChannels: Set<TwitchUsername> = new Set();
  private static ongoingChannels: Set<TwitchUsername> = new Set();

  public static async start() {
    try {
      await this.connectToServices();
    } catch (error) {
      console.error("error connecting to services", error);
    }

    await this.initCache();

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
              await TwitterService.tweetMatch(match); // TODO how ot handle error here
            }
          } catch (error) {
            logger.error(
              "failed to tweet, server will keep listening to channel and try again",
              { error, channel, msg }
            );
          }

          // add channel to ongoing channels (set timeout for 20 min)
          this.ongoingChannels.add(channel.substring(1)); // substring to remove #

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

    setInterval(async () => {
      logger.info("START checking pending channels", {
        pendingChannels: this.pendingChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
        players: this.playerData.size,
      });

      const pendingChannelsList = Array.from(this.pendingChannels); // need copy because we remove item from list in loop

      const checkChannelPromises = [];
      for (const channel of pendingChannelsList) {
        checkChannelPromises.push(this.checkChannel(channel));
      }

      await Promise.allSettled(checkChannelPromises);
      logger.info("END checking pending channels", {
        pendingChannels: this.pendingChannels.size,
        listeningChannels: Array.from(this.listeningChannels),
        players: this.playerData.size,
      });

      // TODO what happens when streamer goes offline?
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
    );
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

  private static async checkChannel(channel: string): Promise<void> {
    if (!(await TwitchService.isStreamLive(channel))) return; // TODO have to validate they're playing league too (and in champions queue hmmmm)

    logger.info("stream is live", { channel });
    return TwitchService.chatClient
      .join(channel)
      .then(() => {
        this.listeningChannels.add(channel); // TODO what's the point of this

        // update pending list
        this.pendingChannels.delete(channel);
      })
      .catch((err) => console.error("failed to join channel", err));
  }
}
