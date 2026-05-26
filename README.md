# Champion's Queue Twitter Bot

Twitter bot that posts live game updates for Champion's Queue ([@ChampsQueueBot](https://x.com/ChampsQueueBot)).

<img width="800" alt="Screenshot 2026-05-25 at 5 49 39 PM" src="https://github.com/user-attachments/assets/bb14c38e-6923-4635-85cf-cf02c77554b5" />

<img width="663" alt="Screenshot 2026-05-25 at 5 50 18 PM" src="https://github.com/user-attachments/assets/64026427-b708-4f14-9d96-54e9fb0bb0ce" />



## What is Champion's Queue?

[Champion's Queue](https://championsqueue.lolesports.com/en-us/about) is a private server for pro North American League of Legends players with a dedicated leaderboard and prizepool.

## Why?
Originally live game updates were being done manually by [@ChampionsQueue](https://twitter.com/ChampionsQueue). I built this twitter bot to help automate the process and further engage the community with Champion's Queue.

## How it works

Because real-time CQ game data is not available to the public I opted to make this bot entirely community driven by Twitch mods. Not truly automated, but an alternative to help the current situation until official dev support steps in.

Each day when CQ opens, the bot starts up and tries to listen to each live CQ streamer's Twitch chat (which is automatically refreshed to account for streamers that leave/join later). Whenever a mod enters the `!editcom !teams` command, the bot validates the command, generates an image with the given players, and tweets a live game update. Mods can use [this web tool](https://champions-queue-cmd-builder.vercel.app) to help generate the command.

## Development

Clone the repo and run `npm install` to install dependencies.

- **Twitch Tokens**: 
  - Create a file called [`twitch-tokens.<TWITCH_ID>.json`](https://twurple.js.org/docs/auth/providers/refreshing.html) (be mindful to look at documentation that matches our twurple version)
    - ```
      {
        "accessToken": "INITIAL_ACCESS_TOKEN",
        "refreshToken": "INITIAL_REFRESH_TOKEN",
        "expiresIn": 0,
        "obtainmentTimestamp": 0
      }
      ```
  - Create a twitch app on the developer dashboard and remember `CLIENT_ID`, `REDIRECT_URI`, and `CLIENT_SECRET`
  - Enter this link into the browser and remember code in response url: https://id.twitch.tv/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&response_type=code&scope=chat:read chat:edit
    - See scopes here: https://dev.twitch.tv/docs/authentication/scopes/
  - Make a POST request to get access and refresh tokens:
    - ```
      curl -X POST 'https://id.twitch.tv/oauth2/token' \
      -d 'client_id=YOUR_CLIENT_ID' \
      -d 'client_secret=YOUR_CLIENT_SECRET' \
      -d 'code=YOUR_CODE' \
      -d 'grant_type=authorization_code' \
      -d 'redirect_uri=YOUR_REDIRECT_URI'
      ```  
- **Database**: Scrape player data from https://championsqueue.lolesports.com/en-us/ and persist data in a MongoDB instance (see `player.service.ts` for schema)
- **Environment Variables**: create `.env.development` file with the following variables

  ```
  # Get tokens from: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
  TWITCH_USERNAME=*
  TWITCH_ID=* # get this from a tool like: https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/
  TWITCH_CLIENT_ID=*
  TWITCH_SECRET=*
  TWITCH_REDIRECT_URI=*

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
- **Linux**: if you're working on linux, make sure to install `chromium-browser`, otherwise `puppeteer` won't work.
  ```
  sudo apt update
  sudo apt install chromium-browser
  ```
