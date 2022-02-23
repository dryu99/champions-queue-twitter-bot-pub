export interface Player {
  summonerName: string;
  summonerNameWithTeam: string;
  team: string;
  twitchUsername?: string;
}

export type SummonerName = string;
export interface Match {
  blueTeam: SummonerName[];
  redTeam: SummonerName[];
}

export interface PlayerCache {
  summonerName: SummonerName;
  prevMatch?: Match;
}
