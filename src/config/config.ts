import dotenv from "dotenv";

dotenv.config();

const Config = {
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID as string,
  TWITCH_SECRET: process.env.TWITCH_SECRET as string,
};

export default Config;
