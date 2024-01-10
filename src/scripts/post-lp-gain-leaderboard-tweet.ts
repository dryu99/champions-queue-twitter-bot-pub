import dayjs from "dayjs";
import mongoose from "mongoose";
import { rankPlayersByLpGain } from "../lib/rank";
import { Role } from "../lib/role";
import { parseSummonerName } from "../lib/summoner-name";
import { parseTeamName } from "../lib/team";
import { MatchBotService } from "../services/matchbot.service";
import { PlayerSnapshotService } from "../services/player-snapshot.service";
import PlayerService from "../services/player.service";
import TwitterService from "../services/twitter.service";
import { LpGainLeaderboardPlayer } from "../types";
import Config from "../utils/config";
import { initDayjs } from "../utils/init";
import logger from "../utils/logger";

const main = async () => {
  logger.info("Starting post-lp-gain-leaderboard-tweet");

  initDayjs("NA");
  TwitterService.init();
  await mongoose.connect(Config.ATLAS_URL);

  const now = dayjs().tz();
  const midnightYesterday = now
    .subtract(1, "day")
    .startOf("day")
    .utc()
    .toDate();

  const apiPlayers = await MatchBotService.fetchPlayers();

  const leaderboardPlayers: LpGainLeaderboardPlayer[] = [];
  for (const apiPlayer of apiPlayers) {
    if (apiPlayer.wins === null || apiPlayer.losses === null) {
      continue;
    }

    const summonerNameWithTeam = apiPlayer.username.split("#")[0].trim();
    const summonerName = parseSummonerName(summonerNameWithTeam);
    const team = parseTeamName(summonerNameWithTeam);

    console.log("Processing api player", { summonerNameWithTeam });

    const [snapshot, dbPlayer] = await Promise.all([
      PlayerSnapshotService.getOneByLcSummonerNameAndDate(
        summonerNameWithTeam,
        midnightYesterday
      ),
      PlayerService.getOneBySummonerName(summonerName.toLowerCase()),
    ]);

    leaderboardPlayers.push({
      id: apiPlayer.id,
      summonerNameWithTeam,
      prevLp: snapshot?.lp ?? -1,
      currLp: apiPlayer.elo,
      prevWins: snapshot?.wins,
      currWins: apiPlayer.wins,
      prevLosses: snapshot?.losses,
      currLosses: apiPlayer.losses,
      team,
      role: dbPlayer?.role as Role | undefined,
      prevRank: snapshot?.rank,
      currRank: -1,
      twitterUsername: dbPlayer?.twitterLink,
    });
  }

  const filteredLeaderboardPlayers = leaderboardPlayers.filter(
    (player) => player.prevLp !== -1
  );
  const sortedLeaderboardPlayers = filteredLeaderboardPlayers.sort(
    (a, b) => b.currLp - b.prevLp - (a.currLp - a.prevLp)
  );

  // calc ranks
  rankPlayersByLpGain(sortedLeaderboardPlayers);

  const topLeaderboardPlayers = sortedLeaderboardPlayers.slice(0, 10);

  console.log(topLeaderboardPlayers);

  // await TwitterService.tweetLeaderboard(leaderboardPlayers);
  process.exit(0);
};

main();
