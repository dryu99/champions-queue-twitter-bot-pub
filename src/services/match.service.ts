import { Match, MatchPlayer } from "../types";
import { calcStrHash } from "../lib/str-hash";

interface MatchHashData {
  hash: number;
  reverseHash: number;
}

export default class MatchService {
  // we use this to keep track of which matches played so we can avoid duplicate posts
  private matchHashes: Set<number> = new Set();

  public isMatchDuplicate(hashData: MatchHashData): boolean {
    return (
      this.matchHashes.has(hashData.hash) ||
      this.matchHashes.has(hashData.reverseHash)
    );
  }

  public addHash(hashData: MatchHashData) {
    this.matchHashes.add(hashData.hash);
    this.matchHashes.add(hashData.reverseHash);
  }

  public calcMatchHashData(match: Match): MatchHashData {
    // const isMatchDuplicate =
    // this.matchHashes.has(matchHash.hash) ||
    // this.matchHashes.has(matchHash.reverseHash);
    const blueTeamNames = match.blueTeam.map(
      (player) => player.summonerNameWithTeam
    );
    const redTeamNames = match.redTeam.map(
      (player) => player.summonerNameWithTeam
    );

    const matchText = [...blueTeamNames, ...redTeamNames].join();
    const reverseMatchText = [...redTeamNames, ...blueTeamNames].join();

    return {
      hash: calcStrHash(matchText),
      reverseHash: calcStrHash(reverseMatchText),
    };
  }

  public getMatchHashesSize(): number {
    return this.matchHashes.size;
  }
}
