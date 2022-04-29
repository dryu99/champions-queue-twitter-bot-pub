import dayjs from "dayjs";
import { writeFileSync } from "fs";
import path from "path";
import HtmlService from "../services/html.service";
import ImageService from "../services/image.service";
import TwitterService, { MatchTweetData } from "../services/twitter.service";
import LiveGameUpdate from "../ui/components/live-game-update";
import { wait } from "../utils/wait";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { calcStrHash } from "../lib/str-hash";
import ChampsQueueService from "../services/champs-queue.service";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);
dayjs.tz.setDefault("America/Los_Angeles");

const matchData: MatchTweetData = {
  author: "test",
  match: {
    blueTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "CLG Dhokla",
        twitchUsername: "dhoklalol",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "CLG RoseThorn",
        twitchUsername: "rosethornlol",
      },
      {
        isStreaming: true,
        summonerNameWithTeam: "WCA Crazy Goose",
        twitchUsername: "thepowerofevil",
      },
      { isStreaming: false, summonerNameWithTeam: "Keith" },
      {
        isStreaming: false,
        summonerNameWithTeam: "C9 Isles",
        twitchUsername: "islesworld",
      },
    ],
    redTeam: [
      {
        isStreaming: true,
        summonerNameWithTeam: "Pobelter",
        twitchUsername: "pobelter",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY josedeodo",
        twitchUsername: "josedeodo",
      },
      {
        isStreaming: false,
        summonerNameWithTeam: "FLY Toucouille",
        twitchUsername: "toucouille_lol",
      },
      { isStreaming: false, summonerNameWithTeam: "EST Bvoy" },
      { isStreaming: false, summonerNameWithTeam: "EST Mia" },
    ],
  },
};

(async () => {
  // await wait(1000 * 5);
  // const logoPath = path.resolve(__dirname, "./tsm.png");
  // const matchHash = calcStrHash(
  //   "!editcom !teams TSM Huni / 100 Huhi / FLY Tomo / DARE Snow2 / 100 Gamsu | vs. | 100 Closer / DARE BMFX / MU Azog / DIG River / 100 Tenacity"
  // );
  // console.log({ matchHash });

  // TwitterService.init();
  // const id = await TwitterService.twitterClient.v1.uploadMedia(logoPath);
  // console.log({ id });
  // const res = await TwitterService.twitterClient.v2.tweet("test tweet", {
  //   media: { media_ids: [id] },
  // });
  // console.log({ res });

  // HTML EXAMPLE
  const html = HtmlService.buildComponentHtml(LiveGameUpdate, { matchData });
  writeFileSync("test.html", html);
  console.log("done creating html");

  await ImageService.savePng(
    html,
    {
      width: 610,
      height: 400,
    },
    "test.png"
  );

  // console.log("done saving png");

  // TwitterService.init();
  // await TwitterService.tweetMatch(matchData);
  // console.log("done tweeting");

  console.log("split day", ChampsQueueService.getSplitDay());
})();
