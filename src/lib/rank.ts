// note: manipulates given array in place
export function rankPlayers(players: { lp: number; rank: number }[]): void {
  let currentRank = 1;
  let previousElo = players[0]?.lp; // assuming the list is not empty and sorted
  let offset = 0; // to track the number of players with the same elo

  for (let i = 0; i < players.length; i++) {
    if (players[i].lp === previousElo) {
      // If the elo is the same as the previous player, they share the same rank
      players[i].rank = currentRank;
      offset++;
    } else {
      // If the elo is different, update the rank and assign it
      currentRank += offset;
      offset = 1; // reset offset for the next set of possible ties
      players[i].rank = currentRank;
      previousElo = players[i].lp; // update the previousElo to the current player's elo
    }
  }
}
