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
