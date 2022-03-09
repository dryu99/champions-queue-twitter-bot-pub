import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import fs from "fs";
import path from "path";
import { ChatClient } from "@twurple/chat";
import Config from "../config/config";

class TwitchService {
  public static apiClient: ApiClient;
  public static chatClient: ChatClient;

  public static async init() {
    const tokenData = JSON.parse(
      fs.readFileSync(Config.getTwitchTokensPath(), {
        encoding: "utf-8",
      })
    );

    console.log("initializing auth provider");
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
    console.log("connected to twitch");

    return this.chatClient.connect();
  }

  // TODO change name to reflect checking game too
  public static async isStreamLive(twitchUsername: string): Promise<boolean> {
    try {
      const user = await this.apiClient.users.getUserByName(twitchUsername);
      if (!user) return false;
      const stream = await user.getStream();
      return stream !== null && stream.gameName === "League of Legends";
    } catch (err) {
      console.error("error checking stream live", { twitchUsername });
      return false;
    }
  }

  public static async isUserMod(
    channel: string,
    twitchUsername: string
  ): Promise<boolean> {
    // const user = await this.apiClient.users.getUserByName( );
    const isUserMod = await this.apiClient.moderation.checkUserMod(
      channel,
      twitchUsername
    );

    // TODO fix this
    //     (node:51970) UnhandledPromiseRejectionWarning: Error: This token does not have the requested scopes (moderation:read) and can not be upgraded.
    // If you need dynamically upgrading scopes, please implement the AuthProvider interface accordingly:

    return isUserMod;
  }
}

export default TwitchService;
