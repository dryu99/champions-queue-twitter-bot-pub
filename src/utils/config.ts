import dotenv from "dotenv";
import path from "path";

dotenv.config();

const getTwitchTokensPath = (): string => {
  return path.resolve(__dirname, "../../twitch-tokens.json");
};

const Config = {
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID as string,
  TWITCH_SECRET: process.env.TWITCH_SECRET as string,
  TWITTER_API_KEY: process.env.TWITTER_API_KEY as string,
  TWITTER_API_KEY_SECRET: process.env.TWITTER_API_KEY_SECRET as string,
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN as string,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN as string,
  TWITTER_ACCESS_TOKEN_SECRET: process.env
    .TWITTER_ACCESS_TOKEN_SECRET as string,
  TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID as string,
  TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET as string,
  ATLAS_URL: process.env.ATLAS_URL as string,
  getTwitchTokensPath,
};

export default Config;
