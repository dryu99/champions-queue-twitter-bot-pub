import dayjs from "dayjs";
import mongoose from "mongoose";
import { rankPlayersByLp } from "../lib/rank";
import { Role } from "../lib/role";
import { parseSummonerName } from "../lib/summoner-name";
import { parseTeamName } from "../lib/team";
import { MatchBotService } from "../services/matchbot.service";
import { PlayerSnapshotService } from "../services/player-snapshot.service";
import PlayerService from "../services/player.service";
import TwitterService from "../services/twitter.service";
import { LeaderboardPlayer } from "../types";
import Config from "../utils/config";
import { initDayjs } from "../utils/init";
import logger from "../utils/logger";

const main = async () => {
  logger.info("Starting post-lp-leaderboard-tweet");

  initDayjs("NA");
  TwitterService.init();
  await mongoose.connect(Config.ATLAS_URL);

  const apiPlayers = await MatchBotService.fetchPlayers();
  const topApiPlayers = apiPlayers.slice(0, 10);

  const leaderboardPlayers: LeaderboardPlayer[] = [];
  for (const apiPlayer of topApiPlayers) {
    if (apiPlayer.wins === null || apiPlayer.losses === null) {
      continue;
    }

    const summonerNameWithTeam = apiPlayer.username.split("#")[0].trim();
    const summonerName = parseSummonerName(summonerNameWithTeam);
    const team = parseTeamName(summonerNameWithTeam);

    console.log("Processing api player", { summonerNameWithTeam });

    const dbPlayer = await PlayerService.getOneBySummonerName(
      summonerName.toLowerCase()
    );

    leaderboardPlayers.push({
      id: apiPlayer.id,
      summonerNameWithTeam,
      lp: apiPlayer.elo,
      wins: apiPlayer.wins,
      losses: apiPlayer.losses,
      team,
      role: dbPlayer?.role as Role | undefined,
      rank: -1,
      twitterUsername: dbPlayer?.twitterLink,
      rankChangeStatus: "same",
    });
  }

  // calc ranks
  rankPlayersByLp(leaderboardPlayers);

  // calc rank change status
  const now = dayjs().tz();
  const midnightYesterday = now
    .subtract(1, "day")
    .startOf("day")
    .utc()
    .toDate();
  for (let i = 0; i < leaderboardPlayers.length; i++) {
    const currLeaderboardPlayer = leaderboardPlayers[i];

    const snapshot = await PlayerSnapshotService.getOneByLcSummonerNameAndDate(
      currLeaderboardPlayer.summonerNameWithTeam,
      midnightYesterday
    );

    if (!snapshot || snapshot.rank === -1) {
      currLeaderboardPlayer.rankChangeStatus = "same";
      continue;
    }

    if (currLeaderboardPlayer.rank < snapshot.rank) {
      currLeaderboardPlayer.rankChangeStatus = "up";
    } else if (currLeaderboardPlayer.rank > snapshot.rank) {
      currLeaderboardPlayer.rankChangeStatus = "down";
    } else {
      currLeaderboardPlayer.rankChangeStatus = "same";
    }
  }

  await TwitterService.tweetLpLeaderboard(leaderboardPlayers);
  process.exit(0);
};

main();
