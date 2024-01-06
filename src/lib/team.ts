import TeamsLogoJSON from "../ui/assets/team-logos.json";

const TeamsLogoData = TeamsLogoJSON as Record<string, { base64: string }>;

export const getTeamLogoBase64 = (team: string): string | undefined => {
  let realTeam = team.toUpperCase();

  if (team === "EG") {
    realTeam = "EG";
  } else if (team === "100X") {
    realTeam = "100";
  } else if (team === "FLYC") {
    realTeam = "FLY";
  } else if (team === "TLC") {
    realTeam = "TL";
  }

  const teamLogoBase64 = TeamsLogoData[realTeam]?.base64;
  return teamLogoBase64;
};

export const parseTeamName = (summonerNameWithTeam: string): string => {
  const words = summonerNameWithTeam.split(" ");

  // doesn't include team
  if (words.length === 1) return "";

  // might include team
  const teamName = words[0];
  const isValidTeamName = teamName.length <= 4;
  if (!isValidTeamName) return "";

  return teamName;
};
