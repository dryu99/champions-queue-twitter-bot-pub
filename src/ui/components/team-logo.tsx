import React from "react";
import styled from "styled-components";
import { getTeamLogoBase64 } from "../../lib/team";
import { TeamSide } from "./live-game-update";

const TeamLogoImg = styled.img<{ teamSide: TeamSide }>`
  display: inline-block;
  ${(props) => props.teamSide === "left" && "margin-right: 0.25em;"}
  ${(props) => props.teamSide === "right" && "margin-left: 0.25em;"}
  width: 37.5px;
  height: 37.5px;
`;

const EmptyLogo = styled.div<{ teamSide: TeamSide }>`
  width: 37.5px;
  height: 37.5px;
  ${(props) => props.teamSide === "left" && "margin-right: 0.25em;"}
  ${(props) => props.teamSide === "right" && "margin-left: 0.25em;"}
`;

interface TeamLogoProps {
  teamSide: TeamSide;
  team: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ teamSide, team }) => {
  const teamLogoBase64 = getTeamLogoBase64(team);
  if (!teamLogoBase64) return <EmptyLogo teamSide={teamSide} />;
  return <TeamLogoImg teamSide={teamSide} src={teamLogoBase64} />;
};

export default TeamLogo;
