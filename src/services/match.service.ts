import { Match, MatchPlayer } from "../types";
import { calcStrHash } from "../lib/str-hash";
import { parseSummonerName } from "../lib/summoner-name";

interface MatchHashData {
  hash: number;
}

export default class MatchService {
  // we use this to keep track of which matches played so we can avoid duplicate posts
  private matchHashes: number[] = []; // TODO not scalable, should hover around 120 - 160 items atm. Can use ordered set later

  public isMatchDuplicate(hashData: MatchHashData): boolean {
    return this.matchHashes.includes(hashData.hash);
  }

  public enqueueHash(hashData: MatchHashData) {
    this.matchHashes.push(hashData.hash);
  }

  public dequeueHash() {
    const hash = this.matchHashes.shift();
  }

  public calcMatchHashData(match: Match): MatchHashData {
    const allSummonerNamesInMatch = match.blueTeam
      .concat(match.redTeam)
      .map((player) =>
        parseSummonerName(player.summonerNameWithTeam).toLowerCase()
      )
      .sort();

    const matchText = allSummonerNamesInMatch.join();

    return {
      hash: calcStrHash(matchText),
    };
  }

  public getMatchHashesSize(): number {
    return this.matchHashes.length;
  }
}
