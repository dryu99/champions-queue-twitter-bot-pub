import { Role } from "./lib/role";

export type SummonerNameWithTeam = string;

export interface Match {
  blueTeam: MatchPlayer[];
  redTeam: MatchPlayer[];
}

export interface MatchPlayer {
  summonerNameWithTeam: SummonerNameWithTeam;
  isStreaming: boolean;
  twitchUsername?: string;
  twitterUsername?: string;
}

export type TwitchUsername = string;
export type LowerCaseSummonerNameWithTeam = string;

export type Region = "NA" | "EU";

export type ApiPlayer = {
  id: number;
  username: string;
  discordId: string;
  twitch: string | null;
  twitter: string | null;
  youtube: string | null;
  elo: number;
  wins: number | null;
  losses: number | null;
  totalOffset: number | null;
  dodgeTotal: number;
  decayTotal: number;
  live: boolean;
};

export type LeaderboardPlayer = {
  id: number;
  summonerNameWithTeam: string;
  lp: number;
  wins: number;
  losses: number;
  team: string;
  role?: Role;
  rank: number;
  twitterUsername?: string;
  rankChangeStatus: "up" | "down" | "same";
};

export type LpGainLeaderboardPlayer = {
  id: number;
  summonerNameWithTeam: string;
  prevLp: number;
  lp: number;
  prevWins: number;
  wins: number;
  prevLosses: number;
  losses: number;
  team: string;
  role?: Role;
  prevRank?: number;
  rank: number;
  lpGainRank: number;
  twitterUsername?: string;
};

export type LeaderboardTeam = {
  team: string;
  players: string[];
  lp: number;
  wins: number;
  losses: number;
};
