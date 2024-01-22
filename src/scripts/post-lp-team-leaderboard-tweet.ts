import HtmlService from "../services/html.service";
import ImageService from "../services/image.service";
import { MatchBotService } from "../services/matchbot.service";
import TwitterService from "../services/twitter.service";
import { LeaderboardTeam } from "../types";
import { LpTeamLeaderboard } from "../ui/components/lp-team-leaderboard";
import Config from "../utils/config";
import { initDayjs } from "../utils/init";
import logger from "../utils/logger";

const VALID_PLAYER_NAMES: Record<string, string> = {
  "100 Quid#eProd": "100",
  "100 Sniper #eprod": "100",
  "100 River#eProd": "100",
  "100 Eyla#eprod": "100",
  "100 Meech#eprod": "100",
  "DIG Tomo#eprod": "DIG",
  "DIG Isles#eProd": "DIG",
  "DIG Rich#eProd": "DIG",
  "DIG eXyu#eProd": "DIG",
  "DIG Dove #eprod": "DIG",
  "TL CoreJJ#eProd": "TL",
  "TL Yeon#eprod": "TL",
  "TL APA": "TL",
  "TL Umti #eprod": "TL",
  "TL Impact": "TL",
  "IMT Armao#eProd": "IMT",
  "IMT Tactical#eprod": "IMT",
  "IMT OLLEH#eprod": "IMT",
  "IMT Mask#eProd": "IMT",
  "IMT Castle#eProd": "IMT",
  "FLY Bwipo#eProd": "FLY",
  "FLY Inspired#eProd": "FLY",
  "FLY Jensen#eProd": "FLY",
  "Fly Busio#eProd": "FLY",
  "Fly Massu#eprod": "FLY",
  "SR Tomio#eProd": "SR",
  "SR Insanity#eprod": "SR",
  "SR Bugi#eprod": "SR",
  "SR FakeGod#eProd": "SR",
  "SR Zeyzal#eProd": "SR",
  "C9 Fudge#eprod": "C9",
  "C9 Blaber #eProd": "C9",
  "C9 VULCAN #eProd": "C9",
  "C9Berserker #eprod": "C9",
  "jojopyun#eProd": "C9",
  "NRG Dhokla#eprod": "NRG",
  "NRG FBI#eProd": "NRG",
  "NRG Palafox#eprod": "NRG",
  "NRG Contractz#Eprod": "NRG",
  "Huhi#eProd": "NRG",
};

const main = async () => {
  logger.info("Starting post-lp-team-leaderboard-tweet");

  initDayjs("NA");
  TwitterService.init();

  const apiPlayers = await MatchBotService.fetchPlayers();
  const teamStats: Record<string, LeaderboardTeam> = {};

  for (const apiPlayer of apiPlayers) {
    if (!Object.keys(VALID_PLAYER_NAMES).includes(apiPlayer.username)) continue;
    const teamName = VALID_PLAYER_NAMES[apiPlayer.username];
    const summonerNameWithTeam = apiPlayer.username.split("#")[0].trim();

    if (!teamStats[teamName]) {
      teamStats[teamName] = {
        wins: 0,
        losses: 0,
        players: [],
        lp: 0,
        team: teamName,
      };
    }

    if (
      apiPlayer.wins !== null &&
      apiPlayer.losses !== null &&
      apiPlayer.elo !== null
    ) {
      teamStats[teamName].wins += apiPlayer.wins;
      teamStats[teamName].losses += apiPlayer.losses;
      teamStats[teamName].lp += apiPlayer.elo;
      teamStats[teamName].players.push(summonerNameWithTeam);
    }
  }

  const leaderboardTeams = Object.values(teamStats);
  leaderboardTeams.sort((a, b) => b.lp - a.lp);

  const tweetText = "";
  const html = HtmlService.buildComponentHtml(LpTeamLeaderboard, {
    teams: leaderboardTeams,
    region: "NA",
  });

  // height formula:
  // 1. first calculate desired_height in pixels (brute force) for LCS + LLA graphics
  // 2. then calculate 10x + y = LCS_desired_height and 8x + y = LLA_desired_height (number of rows may differ)
  // 3. then calculate x by doing -10x + LCS_desired_height = -8x + LLA_desired_height
  // 4. voila you have y and x
  const baseHeight = 325;
  const rowScale = 60;
  const height = rowScale * leaderboardTeams.length + baseHeight;
  const width = 875;

  await ImageService.savePng(
    html,
    {
      width,
      height,
    },
    Config.NODE_ENV === "development" ? "lp-team-leaderboard.png" : undefined
  );

  process.exit(0);
};

main();
