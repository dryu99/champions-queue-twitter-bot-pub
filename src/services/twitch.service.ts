import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import fs from "fs";
import { ChatClient } from "@twurple/chat";
import Config from "../utils/config";
import logger from "../utils/logger";
import BugService from "./bug.service";

class TwitchService {
  public static apiClient: ApiClient;
  public static chatClient: ChatClient;
  private static readonly specialMods: string[] = ["wintersward", "utpamas"];

  public static async init() {
    const tokenData = JSON.parse(
      fs.readFileSync(Config.getTwitchTokensPath(), {
        encoding: "utf-8",
      })
    );

    logger.info("initializing twitch auth provider");
    const authProvider = new RefreshingAuthProvider(
      {
        clientId: Config.TWITCH_CLIENT_ID,
        clientSecret: Config.TWITCH_SECRET,
        onRefresh: (newTokenData) =>
          fs.writeFileSync(
            Config.getTwitchTokensPath(),
            JSON.stringify(newTokenData, null, 4),
            { encoding: "utf-8" }
          ),
      },
      tokenData
    );

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
      logger.error("error checking stream live", {
        twitchUsername,
        err,
      });
      BugService.captureException(err);
      return false;
    }
  }

  public static async isUserMod(
    channel: string, // starts with #
    modUsername: string
  ): Promise<boolean> {
    if (modUsername === channel.slice(1)) return true;
    if (this.isUserSpecialMod(modUsername)) return true;

    const mods = await this.chatClient.getMods(channel);
    return mods.includes(modUsername);
  }

  public static isUserSpecialMod(twitchUsername: string): boolean {
    return this.specialMods.includes(twitchUsername);
  }
}

export default TwitchService;
