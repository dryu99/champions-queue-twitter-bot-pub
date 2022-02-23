import dotenv from "dotenv";
import path from "path";

dotenv.config();

const getTwitchTokensPath = (): string => {
  return path.resolve(__dirname, "./twitch-tokens.json");
};

const Config = {
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID as string,
  TWITCH_SECRET: process.env.TWITCH_SECRET as string,
  getTwitchTokensPath,
};

export default Config;
