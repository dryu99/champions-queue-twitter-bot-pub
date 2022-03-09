import { PrivateMessage } from "@twurple/chat/lib";
import mongoose from "mongoose";
import Config from "./config/config";
import PlayerService, { TwitchPlayer } from "./services/player.service";
import TwitchService from "./services/twitch.service";
import TwitterService from "./services/twitter.service";
import { Match } from "./types";

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

    const twitchService = await TwitchService.getInstance();
    const twitterService = TwitterService.getInstance();

    twitchService.chatClient.onMessage(
      async (
        channel: string,
        user: string,
        msg: string,
        privateMsg: PrivateMessage
      ) => {
        // const isUserMod = await twitchService.isUserMod(channel, user);

        // if (!isUserMod) {
        //   console.log()
        //   return
        // }

        if (msg.includes("!editcom !teams")) {
          // TODO have to check if sender is mod
          console.log({ channel, user, msg });
          // 1. parse message to match

          try {
            const match = this.parseMatchMessage(msg);

            // 2. post match to twitter
            await twitterService.tweetLiveMatch(match); // TODO how ot handle error here

            // 3. add channel to ongoing channel (set timeout for 20 min)
            this.pendingChannels.add(channel.substring(1)); // TODO should be adding to ongoing channels here but w/e

            // 4. stop listening to channel
            twitchService.chatClient.part(channel);
            this.listeningChannels.delete(channel);
          } catch (error) {
            console.error("failed to check message", { error, msg });
            return;
          }
        }
      }
    );

    setInterval(async () => {
      console.log("START checking pending channels", {
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
      console.log("END checking pending channels", {
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
    // connect to services
    await TwitchService.getInstance();
    TwitterService.getInstance();

    // connect to db
    await mongoose.connect(Config.ATLAS_URL);
    console.log("connected to db");
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

    console.log({ blueTeam, redTeam });

    return {
      blueTeam,
      redTeam,
    };
  }

  private static async checkChannel(channel: string): Promise<void> {
    const twitchService = await TwitchService.getInstance();

    if (!(await twitchService.isStreamLive(channel))) return; // TODO have to validate they're playing league too (and in champions queue hmmmm)

    console.log("stream is live", { channel });
    return twitchService.chatClient
      .join(channel)
      .then(() => {
        this.listeningChannels.add(channel); // TODO what's the point of this

        // update pending list
        this.pendingChannels.delete(channel);
      })
      .catch((err) => console.error("failed to join channel", err));
  }
}
