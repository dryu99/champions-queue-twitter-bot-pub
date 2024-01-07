import mongoose from "mongoose";
import { Role } from "../lib/role";
import { parseSummonerName } from "../lib/summoner-name";
import { parseTeamName } from "../lib/team";
import { DbPlayer, PlayerModel } from "../services/player.service";
import TwitterService from "../services/twitter.service";
import Config from "../utils/config";
import { initApp } from "../utils/init";

type ApiPlayer = {
  id: number;
  username: string;
  discordId: string;
  twitch: string | null;
  twitter: string | null;
  youtube: string | null;
  elo: number;
  wins: number;
  losses: number;
  totalOffset: number | null;
  dodgeTotal: number;
  decayTotal: number;
  live: boolean;
};

export type LeaderboardPlayer = {
  id: number;
  summonerNameWithTeam: string;
  elo: number;
  wins: number;
  losses: number;
  team: string;
  role?: Role;
  rank: number;
};

const main = async () => {
  initApp("NA");
  TwitterService.init();
  await mongoose.connect(Config.ATLAS_URL);

  const apiPlayersRaw = await fetch(
    "https://riot-nae-strapi-app.azurewebsites.net/api/ladder/3/1/1"
  );

  const apiPlayers = (await apiPlayersRaw.json()) as ApiPlayer[];
  const topApiPlayers = apiPlayers.slice(0, 10);

  const leaderboardPlayers: LeaderboardPlayer[] = [];
  for (const apiPlayer of topApiPlayers) {
    const summonerNameWithTeam = apiPlayer.username.split("#")[0];
    const summonerName = parseSummonerName(summonerNameWithTeam);
    const team = parseTeamName(summonerNameWithTeam);

    console.log("Processing api player", { summonerNameWithTeam });

    const dbPlayer = (await PlayerModel.findOne({
      lcSummonerName: summonerName.toLowerCase(),
    })) as unknown as DbPlayer;

    leaderboardPlayers.push({
      id: apiPlayer.id,
      summonerNameWithTeam,
      elo: apiPlayer.elo,
      wins: apiPlayer.wins,
      losses: apiPlayer.losses,
      team,
      role: dbPlayer?.role as Role | undefined,
      rank: -1,
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
