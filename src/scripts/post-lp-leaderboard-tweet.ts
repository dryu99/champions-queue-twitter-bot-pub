import dayjs from "dayjs";
import mongoose from "mongoose";
import { rankPlayers } from "../lib/rank";
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

  const now = dayjs();
  const midnightYesterday = now
    .subtract(1, "day")
    .startOf("day")
    .utc()
    .toDate();

  const leaderboardPlayers: LeaderboardPlayer[] = [];
  const prevLeaderboardPlayers: Pick<
    LeaderboardPlayer,
    "rank" | "lp" | "summonerNameWithTeam"
  >[] = []; // TODO delete this in faovur of persissting ranks in db
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

    const snapshot = await PlayerSnapshotService.getOneByLcSummonerNameAndDate(
      summonerNameWithTeam,
      midnightYesterday
    );

    prevLeaderboardPlayers.push({
      summonerNameWithTeam,
      lp: snapshot?.lp ?? -1,
      rank: -1,
    });

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

  // sort prev players by lp first
  prevLeaderboardPlayers.sort((a, b) => b.lp - a.lp);

  // calc ranks
  rankPlayers(leaderboardPlayers);
  rankPlayers(prevLeaderboardPlayers);

  // iterate through leaderboard players and determine rank change status
  for (let i = 0; i < leaderboardPlayers.length; i++) {
    const currLeaderboardPlayer = leaderboardPlayers[i];
    const prevLeaderboardPlayer = prevLeaderboardPlayers.find(
      (p) =>
        p.summonerNameWithTeam === currLeaderboardPlayer.summonerNameWithTeam
    );

    console.log({
      name: currLeaderboardPlayer.summonerNameWithTeam,
      curr: currLeaderboardPlayer.rank,
      prev: prevLeaderboardPlayer?.rank,
    });

    if (!prevLeaderboardPlayer || prevLeaderboardPlayer.rank === -1) {
      currLeaderboardPlayer.rankChangeStatus = "same";
      continue;
    }

    if (currLeaderboardPlayer.rank < prevLeaderboardPlayer.rank) {
      currLeaderboardPlayer.rankChangeStatus = "up";
    } else if (currLeaderboardPlayer.rank > prevLeaderboardPlayer.rank) {
      currLeaderboardPlayer.rankChangeStatus = "down";
    } else {
      currLeaderboardPlayer.rankChangeStatus = "same";
    }
  }

  await TwitterService.tweetLeaderboard(leaderboardPlayers);
  process.exit(0);
};

main();
