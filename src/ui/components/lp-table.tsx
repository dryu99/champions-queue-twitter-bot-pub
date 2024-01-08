import React from "react";
import styled from "styled-components";
import { getRoleLogoBase64ByRole } from "../../lib/role";
import { getTeamLogoBase64 } from "../../lib/team";
import { LeaderboardPlayer } from "../../types";
import ArrowDownIcon from "../assets/icons/arrow-down-icon";
import ArrowUpIcon from "../assets/icons/arrow-up-icon";
import { BG_COLOR, DownArrowText } from "../common";
// import ArrowDownIcon from "./icons/arrow-down-icon";
// import ArrowUpIcon from "./icons/arrow-up-icon";

const LeaderboardTable = styled.table`
  border-collapse: separate;
  border-spacing: 0 0.5em;
  text-align: center;
  margin: 0 auto 0.5em auto;
  font-size: 1.5em;
`;

const TableHeadRow = styled.tr`
  & > th {
    font-size: 1.1em;
    padding: 0.75em 1em;
    background-color: black;
  }
`;

const SpacingCell = styled.td`
  width: 5px;
  background-color: ${BG_COLOR};
`;

const IndexCell = styled.td`
  font-weight: 900;
  text-align: left;
  padding-left: 1.5em !important;
`;

const IndexCellContent = styled.div`
  display: flex;
  align-items: center;
`;

const RankChangeIconContainer = styled.div`
  margin-left: 0.25em;
`;

const TableBodyRow = styled.tr<{ isFirst: boolean }>`
  font-family: "Source Sans Pro";
  background-color: ${(props) =>
    props.isFirst ? "rgb(203, 149, 22)" : "black"};
  color: ${(props) => (props.isFirst ? "black" : "white")};
  height: 50px;

  & > td:not(${SpacingCell}) {
    padding: 0.25em 0.75em;
  }
`;

const TeamLogoImg = styled.img`
  display: inline-block;
  margin-right: 0.4em;
  width: 40px;
`;

const EmptyTeamLogo = styled.div`
  display: inline-block;
  margin-right: 0.4em;
  width: 40px;
  height: 40px;
`;

const TeamBrandContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AvgCellContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AvgCellSubContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CellSubText = styled.span`
  font-size: 0.75em;
`;

const RoleLogoImg = styled.img`
  display: inline-block;
  width: 30px;
`;

interface LpPlayerTableProps {
  players: LeaderboardPlayer[];
}

export const LpPlayerTable: React.FC<LpPlayerTableProps> = ({ players }) => {
  return (
    <LeaderboardTable>
      <thead>
        <TableHeadRow>
          <th>Rank</th>
          <th>Player</th>
          <th>Role</th>
          <th>Games</th>
          <th>Win %</th>
          <SpacingCell />
          <th>
            LP <DownArrowText>▼</DownArrowText>
          </th>
        </TableHeadRow>
      </thead>
      <tbody>
        {players.map((player, i, allStats) => {
          const totalGames = player.wins + player.losses;
          const winRate = Math.round((player.wins / totalGames) * 1000) / 10;

          const teamLogoBase64 = getTeamLogoBase64(player.team);
          const roleLogoBase64 = getRoleLogoBase64ByRole(player.role);

          return (
            <TableBodyRow key={i} isFirst={player.rank === 1}>
              <IndexCell>
                <IndexCellContent>
                  {player.rank}

                  <RankChangeIconContainer>
                    {player.rankChangeStatus === "up" ? (
                      <ArrowUpIcon />
                    ) : player.rankChangeStatus === "down" ? (
                      <ArrowDownIcon />
                    ) : (
                      " "
                    )}
                  </RankChangeIconContainer>
                </IndexCellContent>
              </IndexCell>
              <td>
                <TeamBrandContainer>
                  {teamLogoBase64 ? (
                    <TeamLogoImg src={teamLogoBase64} />
                  ) : (
                    <EmptyTeamLogo />
                  )}
                  {player.summonerNameWithTeam}
                </TeamBrandContainer>
              </td>
              <td>{roleLogoBase64 && <RoleLogoImg src={roleLogoBase64} />}</td>
              <td>{totalGames}</td>
              <td>{winRate}%</td>
              <SpacingCell />
              <td>{player.lp}</td>
            </TableBodyRow>
          );
        })}
      </tbody>
    </LeaderboardTable>
  );
};
