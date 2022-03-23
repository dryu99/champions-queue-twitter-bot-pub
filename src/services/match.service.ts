import { Match, MatchPlayer } from "../types";
import { calcStrHash } from "../lib/str-hash";

interface MatchHashData {
  hash: number;
  reverseHash: number;
}

export default class MatchService {
  // we use this to keep track of which matches played so we can avoid duplicate posts
  private matchHashes: number[] = []; // TODO not scalable, should hover around 120 - 160 items atm. Can use ordered set later

  public isMatchDuplicate(hashData: MatchHashData): boolean {
    return (
      this.matchHashes.includes(hashData.hash) ||
      this.matchHashes.includes(hashData.reverseHash)
    );
  }

  public enqueueHash(hashData: MatchHashData) {
    this.matchHashes.push(hashData.hash);
    this.matchHashes.push(hashData.reverseHash);
  }

  public dequeueHash() {
    const hash1 = this.matchHashes.shift();
    const hash2 = this.matchHashes.shift();
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
    return this.matchHashes.length;
  }
}
