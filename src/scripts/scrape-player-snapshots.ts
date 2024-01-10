import dayjs from "dayjs";
import mongoose from "mongoose";
import { rankPlayersByLp } from "../lib/rank";
import { parseSummonerName } from "../lib/summoner-name";
import { MatchBotService } from "../services/matchbot.service";
import {
  NewPlayerSnapshot,
  PlayerSnapshotService,
} from "../services/player-snapshot.service";
import PlayerService from "../services/player.service";
import { Region } from "../types";
import Config from "../utils/config";
import { initDayjs } from "../utils/init";
import logger from "../utils/logger";

// TODO parse region from command args later if you extend
const region: Region = "NA";

const main = async () => {
  logger.info("Starting scrape-leaderboard-entries");

  initDayjs(region);
  await mongoose.connect(Config.ATLAS_URL);

  const apiPlayers = await MatchBotService.fetchPlayers();

  const playerSnapshots: NewPlayerSnapshot[] = [];
  const now = dayjs().tz();
  const midnightToday = now.startOf("day").utc().toDate();

  for (const apiPlayer of apiPlayers) {
    if (apiPlayer.wins === null || apiPlayer.losses === null) {
      continue;
    }

    const summonerNameWithTeam = apiPlayer.username.split("#")[0].trim();
    const summonerName = parseSummonerName(summonerNameWithTeam);
    logger.info("Processing api player", { apiPlayer: summonerName });

    const dbPlayer = await PlayerService.getOneBySummonerName(
      summonerName.toLowerCase()
    );

    if (!dbPlayer) {
      // insert new player to db
      await PlayerService.addOne({
        summonerName,
        summonerNameWithTeam,
        lcSummonerName: summonerName.toLowerCase(),
        region,
      });
    }

    playerSnapshots.push({
      summonerNameWithTeam,
      lp: apiPlayer.elo,
      wins: apiPlayer.wins,
      losses: apiPlayer.losses,
      date: midnightToday,
      region,
      rank: -1,
    });
  }

  rankPlayersByLp(playerSnapshots);

  const results = await PlayerSnapshotService.addMany(playerSnapshots);
  logger.info("done", { results });

  process.exit(0);
};

main();
