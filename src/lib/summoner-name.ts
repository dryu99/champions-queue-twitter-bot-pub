export const parseSummonerName = (summonerNameWithTeam: string): string => {
  const words = summonerNameWithTeam.split(" ");
  if (words.length === 1) return summonerNameWithTeam;

  const teamName = words[0];
  const isValidTeamName =
    teamName.length <= 4 && teamName === teamName.toUpperCase();
  if (!isValidTeamName) return summonerNameWithTeam;

  return words.slice(1).join(" ");
};
