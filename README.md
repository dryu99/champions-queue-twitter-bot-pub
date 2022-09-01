# Champion's Queue Stream Updates Twitter Bot

Twitter bot that posts live game updates for Champion's Queue ([@ChampQueueBot](https://twitter.com/)).

*Servers have been shut down since April 2022 since [@ChampionsQueue](https://twitter.com/ChampionsQueue) has received official dev support.*

## What is Champion's Queue?

[Champion's Queue](https://championsqueue.lolesports.com/en-us/about) is a private server for pro North American League of Legends players with a dedicated leaderboard and prizepool.

## Why?
Originally live game updates were being done manually by [@ChampionsQueue](https://twitter.com/ChampionsQueue). I built this twitter bot to help automate the process and further engage the community with Champion's Queue.

## How it works

Because real-time CQ game data is not available to the public I opted to make this bot entirely community driven by Twitch mods. Not truly automated, but an alternative to help the current situation until official dev support steps in.

Each day when CQ opens, the bot starts up and tries to listen to each live CQ streamer's Twitch chat (which is automatically refreshed to account for streamers that leave/join later). Whenever a mod enters the `!editcom !teams` command, the bot validates the command, generates an image with the given players, and tweets a live game update. Mods can use [this web tool](https://champions-queue-cmd-builder.vercel.app) to help generate the command.

## Development

Clone the repo and run `yarn` or `npm install` to install dependencies.

- **Twitch Tokens**: Create a file called `twitch-tokens.json` and follow instructions [here](https://twurple.js.org/docs/auth/providers/refreshing.html) to set up Twitch auth
- **Database**: Scrape player data from https://championsqueue.lolesports.com/en-us/ and persist data in a MongoDB instance (see `player.service.ts` for schema)
- **Environment Variables**: create `.env.development` file with the following variables

  ```
  # Get tokens from: https://dev.twitch.tv/docs/authentication/
  TWITCH_USERNAME=*
  TWITCH_CLIENT_ID=*
  TWITCH_SECRET=*

  # Get tokens from: https://developer.twitter.com/en/portal/dashboard
  TWITTER_USERNAME=*
  TWITTER_API_KEY=*
  TWITTER_API_KEY_SECRET=*
  TWITTER_ACCESS_TOKEN=*
  TWITTER_ACCESS_TOKEN_SECRET=*
  TWITTER_CLIENT_ID=*
  TWITTER_CLIENT_SECRET=*

  # MongoDB credentials
  ATLAS_URL=*

  # Optional
  SENTRY_DSN=*
  ```