import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import fs from "fs";
import { ChatClient } from "@twurple/chat";
import Config from "../utils/config";
import logger from "../utils/logger";
import BugService from "./bug.service";

type SpecialMod = {
  twitchUsername: string;
  twitterUsername?: string;
};

export type SpecialChannel = {
  twitchUsername: string;
  twitterUsername: string;
};

class TwitchService {
  public static apiClient: ApiClient;
  public static chatClient: ChatClient;
  public static readonly TEAM_COMMAND = "!editcom !teams";
  public static readonly CQ_COMMAND = "!editcom !cq";
  public static readonly VS_SPLIT_MESSAGE = "| vs. |";
  public static readonly specialChannels: SpecialChannel[] = [
    {
      twitchUsername: "cubbyxx",
      twitterUsername: "Cubbyxx",
    },
    {
      twitchUsername: "kobe",
      twitterUsername: "esports_kobe",
    },
    {
      twitchUsername: "traytonlol",
      twitterUsername: "TraYt0N",
    },
  ];
  private static readonly specialMods: SpecialMod[] = [
    {
      twitchUsername: "wintersward",
      twitterUsername: "WintersWard_",
    },
    {
      twitchUsername: "utpamas",
    },
    {
      twitchUsername: "byongarikong",
    },
    {
      twitchUsername: "jbryu99",
      twitterUsername: "jbryu99",
    },
    {
      twitchUsername: "numiiigoesrawrz",
      twitterUsername: "numiii",
    },
    {
      twitchUsername: "megafreshlemons",
      twitterUsername: "thejasonlemons",
    },
    {
      twitchUsername: "croccc",
      twitterUsername: "crocccccc",
    },
    {
      twitchUsername: "kasinozz",
      twitterUsername: "kasinozz",
    },
  ];

  public static async init() {
    const tokenData = JSON.parse(
      fs.readFileSync(Config.getTwitchTokensPath(), {
        encoding: "utf-8",
      })
    );

    logger.info("initializing twitch auth provider");
    const authProvider = new RefreshingAuthProvider({
      clientId: Config.TWITCH_CLIENT_ID,
      clientSecret: Config.TWITCH_SECRET,
    });

    authProvider.onRefresh(async (userId, newTokenData) =>
      fs.writeFileSync(
        Config.getTwitchTokensPath(),
        JSON.stringify(newTokenData, null, 4),
        "utf-8"
      )
    );
    await authProvider.addUser(Config.TWITCH_ID, tokenData, ["chat"]);

    this.apiClient = new ApiClient({ authProvider });
    this.chatClient = new ChatClient({ authProvider });
    logger.info("connected to twitch");

    return this.chatClient.connect();
  }

  public static async isChannelLive(twitchUsername: string): Promise<boolean> {
    try {
      const user = await this.apiClient.users.getUserByName(twitchUsername);
      if (!user) return false;
      const stream = await user.getStream();
      return stream !== null && stream.gameName === "League of Legends";
    } catch (err) {
      logger.error("error checking stream live", err);
      BugService.captureException(err);
      return false;
    }
  }

  public static async isUserMod(
    channel: string,
    modUsername: string
  ): Promise<boolean> {
    if (modUsername === "nightbot") return false;
    if (modUsername === channel) return true;
    if (this.isUserSpecialMod(modUsername)) return true;

    const modsResult = await this.apiClient.moderation.getModerators(channel);

    return (
      modsResult.data.findIndex((mod) => mod.userName === modUsername) !== -1
    );
  }

  public static isUserSpecialMod(twitchUsername: string): boolean {
    return (
      this.specialMods.findIndex(
        (mod) => mod.twitchUsername === twitchUsername
      ) !== -1
    );
  }

  public static getSpecialMod(twitchUsername: string): SpecialMod | undefined {
    return this.specialMods.find(
      (mod) => mod.twitchUsername === twitchUsername
    );
  }

  public static getSpecialChannel(
    twitchUsername: string
  ): SpecialChannel | undefined {
    return this.specialChannels.find(
      (channel) => channel.twitchUsername === twitchUsername
    );
  }
}

export default TwitchService;
