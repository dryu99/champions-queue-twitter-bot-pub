import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import fs from "fs";
import path from "path";
import { ChatClient } from "@twurple/chat";
import Config from "../config/config";

class TwitchService {
  private static instance?: TwitchService;
  public apiClient: ApiClient;
  public chatClient: ChatClient;

  static async getInstance() {
    if (!TwitchService.instance) {
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

      const apiClient = new ApiClient({ authProvider });
      const chatClient = new ChatClient({ authProvider });

      TwitchService.instance = new TwitchService(apiClient, chatClient);
    }
    return TwitchService.instance;
  }

  constructor(apiClient: ApiClient, chatClient: ChatClient) {
    this.apiClient = apiClient;
    this.chatClient = chatClient;
  }

  public async connect(): Promise<void> {
    return this.chatClient.connect();
  }

  // TODO change name to reflect checking game too
  public async isStreamLive(twitchUsername: string): Promise<boolean> {
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
}

export default TwitchService;
