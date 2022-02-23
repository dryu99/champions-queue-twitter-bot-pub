import dotenv from "dotenv";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import fs from "fs";
import path from "path";
import { ChatClient, PrivateMessage } from "@twurple/chat";

dotenv.config();

const clientId = process.env.TWITCH_CLIENT_ID as string;
const clientSecret = process.env.TWITCH_SECRET as string;

const tokenData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "config/twitch-tokens.json"), {
    encoding: "utf-8",
  })
);

console.log("initializing authProvider");
// As a minor optimization, you may pass the scopes of the token, but be sure they're correct in that case!
const authProvider = new RefreshingAuthProvider(
  {
    clientId,
    clientSecret,
    onRefresh: (newTokenData) =>
      fs.writeFileSync(
        path.resolve(__dirname, "config/twitch-tokens.json"),
        JSON.stringify(newTokenData, null, 4),
        { encoding: "utf-8" }
      ),
  },
  tokenData
);

export async function isStreamLive(twitchUsername: string) {
  const user = await apiClient.users.getUserByName(twitchUsername);
  if (!user) return false;
  return (await user.getStream()) !== null;
}

export const apiClient = new ApiClient({ authProvider });
export const chatClient = new ChatClient({ authProvider });

const TwitchService = {
  apiClient,
  chatClient,
  isStreamLive,
};

export default TwitchService;
