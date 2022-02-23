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
        fs.readFileSync(path.resolve(__dirname, "config/twitch-tokens.json"), {
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
              path.resolve(__dirname, "config/twitch-tokens.json"),
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
    await this.chatClient.connect();
  }

  public async isStreamLive(twitchUsername: string): Promise<boolean> {
    const user = await this.apiClient.users.getUserByName(twitchUsername);
    if (!user) return false;
    return (await user.getStream()) !== null;
  }
}

export default TwitchService;
