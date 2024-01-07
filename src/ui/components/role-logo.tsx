import React from "react";
import styled from "styled-components";
import { getRoleLogoBase64ByIndex } from "../../lib/role";

import { TeamSide } from "./live-game-update";

const RoleLogoImg = styled.img<{ teamSide: TeamSide }>`
  display: inline-block;
  ${(props) => props.teamSide === "left" && "margin-right: 0.25em;"}
  ${(props) => props.teamSide === "right" && "margin-left: 0.25em;"}
  width: 17.5px;
`;

const EmptyLogo = styled.div<{ teamSide: TeamSide }>`
  width: 17.5px;
  height: 17.5px;
  ${(props) => props.teamSide === "left" && "margin-right: 0.25em;"}
  ${(props) => props.teamSide === "right" && "margin-left: 0.25em;"}
`;

interface RoleLogoProps {
  roleIndex: number;
  teamSide: TeamSide;
}

const RoleLogo: React.FC<RoleLogoProps> = ({ teamSide, roleIndex }) => {
  const roleLogoBase64 = getRoleLogoBase64ByIndex(roleIndex);
  if (!roleLogoBase64) return <EmptyLogo teamSide={teamSide} />;
  return <RoleLogoImg teamSide={teamSide} src={roleLogoBase64} />;
};

export default RoleLogo;
