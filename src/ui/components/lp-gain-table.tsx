import React from "react";
import styled from "styled-components";
import { getRoleLogoBase64ByRole } from "../../lib/role";
import { getTeamLogoBase64 } from "../../lib/team";
import ChampsQueueService from "../../services/champs-queue.service";
import { LpGainLeaderboardPlayer } from "../../types";
import { DownArrowText } from "../common";

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
    padding: 0.5em 1em;
    background-color: black;
  }
`;

const SpacingCell = styled.td`
  width: 5px;
`;

const IndexCell = styled.td``;

const TableBodyRow = styled.tr<{ isFirst: boolean }>`
  font-family: "Source Sans Pro";

  & > td:not(${SpacingCell}) {
    padding: 0.2em 0.75em;
    background-color: ${(props) =>
      props.isFirst ? "rgb(203, 149, 22)" : "black"};
    color: ${(props) => (props.isFirst ? "black" : "white")};
  }
`;

const StatGainText = styled.span<{ isPositiveGain: boolean }>`
  color: ${(props) => (props.isPositiveGain ? "#448118" : "#FF0000")};
`;

const CellSubText = styled.span`
  font-size: 0.75em;
`;

const LpGainText = styled.span`
  font-weight: 900;
`;

const PlayerBrandContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TeamLogoImg = styled.img`
  display: inline-block;
  margin-right: 0.4em;
  width: 40px;
`;

const RoleLogoImg = styled.img`
  display: inline-block;
  width: 30px;
`;

interface LpGainPlayerTableProps {
  players: LpGainLeaderboardPlayer[];
}

export const LpGainPlayerTable: React.FC<LpGainPlayerTableProps> = ({
  players,
}) => {
  return (
    <LeaderboardTable>
      <thead>
        <TableHeadRow>
          <th></th>
          <th>Player</th>
          <th>Role</th>
          <th>Games</th>
          <th>Win %</th>
          <th>
            <div>Rank Gain</div>
            <div>
              <CellSubText>
                Day {ChampsQueueService.getSplitDay() - 1} →{" "}
                {ChampsQueueService.getSplitDay()}
              </CellSubText>
            </div>
          </th>
          <SpacingCell /> {/* Fake cell for spacing */}
          <th>
            <div>
              LP Gain <DownArrowText>▼</DownArrowText>
            </div>
            <div>
              <CellSubText>
                Day {ChampsQueueService.getSplitDay() - 1} →{" "}
                {ChampsQueueService.getSplitDay()}
              </CellSubText>
            </div>
          </th>
        </TableHeadRow>
      </thead>
      <tbody>
        {players.map((player, i) => {
          const gamesToday =
            player.wins + player.losses - (player.prevWins + player.prevLosses);
          const winsToday = player.wins - player.prevWins;
          const lpGain = player.lp - player.prevLp;
          const winRate = Math.round((winsToday / gamesToday) * 1000) / 10;

          const teamLogoBase64 = getTeamLogoBase64(player.team);
          const roleLogoBase64 = getRoleLogoBase64ByRole(player.role);

          const isPositiveGain =
            player.prevRank === undefined || player.rank < player.prevRank;

          return (
            <TableBodyRow
              key={player.summonerNameWithTeam}
              isFirst={player.lpGainRank === 1}
            >
              <IndexCell>{player.lpGainRank}</IndexCell>
              <td>
                <PlayerBrandContainer>
                  <TeamLogoImg src={teamLogoBase64} />
                  {player.summonerNameWithTeam}
                </PlayerBrandContainer>
              </td>
              <td>
                <RoleLogoImg src={roleLogoBase64} />
              </td>
              <td>{gamesToday}</td>
              <td>{winRate}%</td>
              <td>
                <div>
                  {player.prevRank === undefined ? (
                    <StatGainText isPositiveGain={true}>
                      ↑{player.rank}
                    </StatGainText>
                  ) : player.rank !== player.prevRank ? (
                    <StatGainText isPositiveGain={isPositiveGain}>
                      {isPositiveGain ? "↑" : "↓"}
                      {Math.abs(player.prevRank - player.rank)}
                    </StatGainText>
                  ) : (
                    "-"
                  )}
                </div>
                <div>
                  ({player.prevRank} → {player.rank}{" "}
                  {player.rank === 1 ? " 👑" : ""})
                </div>
              </td>
              <SpacingCell /> {/* Fake cell for spacing */}
              <td>
                <LpGainText>
                  <StatGainText isPositiveGain={true}>+{lpGain}</StatGainText>
                </LpGainText>
                <div>
                  ({player.prevLp} → {player.lp})
                </div>
              </td>
            </TableBodyRow>
          );
        })}
      </tbody>
    </LeaderboardTable>
  );
};
