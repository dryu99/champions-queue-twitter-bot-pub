import dayjs from "dayjs";
import { writeFileSync } from "fs";
import mongoose from "mongoose";
import { rankPlayersByLp, rankPlayersByLpGain } from "../lib/rank";
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
      lp: apiPlayer.elo,
      prevWins: snapshot?.wins ?? -1,
      wins: apiPlayer.wins,
      prevLosses: snapshot?.losses ?? -1,
      losses: apiPlayer.losses,
      team,
      role: dbPlayer?.role as Role | undefined,
      prevRank: snapshot?.rank,
      rank: -1,
      twitterUsername: dbPlayer?.twitterLink,
      lpGainRank: -1,
    });
  }

  const filteredLeaderboardPlayers = leaderboardPlayers.filter(
    (player) => player.prevLp !== -1
  );

  // calc lp ranks
  const sortedLeaderboardPlayersByLp = filteredLeaderboardPlayers.sort(
    (a, b) => b.lp - a.lp
  );
  rankPlayersByLp(sortedLeaderboardPlayersByLp);

  // calc lp gain ranks
  const sortedLeaderboardPlayersByLpGain = sortedLeaderboardPlayersByLp.sort(
    (a, b) => b.lp - b.prevLp - (a.lp - a.prevLp)
  );
  rankPlayersByLpGain(sortedLeaderboardPlayersByLpGain);

  const topLeaderboardPlayers = sortedLeaderboardPlayersByLpGain.slice(0, 10);

  writeFileSync(
    "./topLeaderboardPlayers.json",
    JSON.stringify(topLeaderboardPlayers)
  );

  await TwitterService.tweetLpGainLeaderboard(topLeaderboardPlayers);
  process.exit(0);
};

main();
