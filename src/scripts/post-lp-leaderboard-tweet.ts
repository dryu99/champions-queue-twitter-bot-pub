import mongoose from "mongoose";
import { Role } from "../lib/role";
import { parseSummonerName } from "../lib/summoner-name";
import { parseTeamName } from "../lib/team";
import { MatchBotService } from "../services/matchbot.service";
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

    const summonerNameWithTeam = apiPlayer.username.split("#")[0];
    const summonerName = parseSummonerName(summonerNameWithTeam);
    const team = parseTeamName(summonerNameWithTeam);

    console.log("Processing api player", { summonerNameWithTeam });

    const dbPlayer = await PlayerService.getOneBySummonerName(
      summonerName.toLowerCase()
    );

    leaderboardPlayers.push({
      id: apiPlayer.id,
      summonerNameWithTeam,
      elo: apiPlayer.elo,
      wins: apiPlayer.wins,
      losses: apiPlayer.losses,
      team,
      role: dbPlayer?.role as Role | undefined,
      rank: -1,
      twitterUsername: dbPlayer?.twitterLink,
    });
  }

  rankPlayers(leaderboardPlayers);

  await TwitterService.tweetLeaderboard(leaderboardPlayers);
  process.exit(0);
};

function rankPlayers(players: LeaderboardPlayer[]): void {
  let currentRank = 1;
  let previousElo = players[0]?.elo; // assuming the list is not empty and sorted
  let offset = 0; // to track the number of players with the same elo

  for (let i = 0; i < players.length; i++) {
    if (players[i].elo === previousElo) {
      // If the elo is the same as the previous player, they share the same rank
      players[i].rank = currentRank;
      offset++;
    } else {
      // If the elo is different, update the rank and assign it
      currentRank += offset;
      offset = 1; // reset offset for the next set of possible ties
      players[i].rank = currentRank;
      previousElo = players[i].elo; // update the previousElo to the current player's elo
    }
  }
}

main();
