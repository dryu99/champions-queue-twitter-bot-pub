import React from "react";
import styled from "styled-components";
import { getTeamLogoBase64 } from "../../lib/team";
import ChampsQueueService from "../../services/champs-queue.service";
import { LeaderboardTeam, Region } from "../../types";
import ChampionsQueueLogoData from "../assets/champions-queue-logo.json";
import {
  BG_COLOR,
  DownArrowText,
  Header,
  HeaderContainer,
  HighlightText,
  SubHeader,
  TableTitle,
} from "../common";
import Root from "./root";

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

const TeamLogoImg = styled.img`
  display: inline-block;
  margin-right: 0.4em;
  width: 40px;
  height: 40px;
`;

const TeamTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FootnoteContainer = styled.div`
  font-family: "Source Sans Pro";
  font-size: 1.2em;
  margin-bottom: 0.75em;
  margin-top: -0.3em;
`;

// TODO include logos (have to download them somewhere)
interface LpTeamLeaderboardProps {
  teams: LeaderboardTeam[];
  region: Region;
}

export const LpTeamLeaderboard: React.FC<LpTeamLeaderboardProps> = ({
  teams,
  region,
}) => {
  return (
    <Root bgColor={BG_COLOR}>
      <HeaderContainer>
        <img src={ChampionsQueueLogoData.NA.base64} />
        <Header>
          <HighlightText region={"NA"}>CHAMPIONS</HighlightText> QUEUE
        </Header>
      </HeaderContainer>
      <SubHeader>
        {/* {region === "NA" ? "🇺🇸" : "🇪🇺"} |{" "} */}
        {ChampsQueueService.CQ_CURR_SEASON_TEXT} | Patch{" "}
        {ChampsQueueService.CQ_CURR_PATCH}
      </SubHeader>
      <TeamTitleContainer>
        <TableTitle>Final Team Standings</TableTitle>
      </TeamTitleContainer>
      <LpTeamTable teams={teams} />
      <div style={{ marginTop: "8px", fontSize: "1.3em" }}>
        <div>@ChampsQueueBot</div>
      </div>
    </Root>
  );
};

interface LpTeamTableProps {
  teams: LeaderboardTeam[];
}

const LpTeamTable: React.FC<LpTeamTableProps> = ({ teams }) => {
  return (
    <LeaderboardTable>
      <thead>
        <TableHeadRow>
          <th>Rank</th>
          <th>Team</th>
          <th>Games</th>
          <th>Win %</th>
          <th>Total LP</th>
          <th>
            <div>
              <AvgCellSubContainer>
                <div>Active </div>
                <div>Players</div>
              </AvgCellSubContainer>
            </div>
          </th>
          <SpacingCell /> {/* Fake cell for spacing */}
          <th>
            <AvgCellContainer>
              <AvgCellSubContainer>
                <div>Avg LP /</div>
                <div>Player</div>
              </AvgCellSubContainer>
              <DownArrowText>▼</DownArrowText>
            </AvgCellContainer>
          </th>
        </TableHeadRow>
      </thead>
      <tbody>
        {teams.map((team, i, allStats) => {
          const totalGames = team.wins + team.losses;
          const winRate = Math.round((team.wins / totalGames) * 1000) / 10;
          const avgLp = Math.round((team.lp / team.players.length) * 10) / 10;

          const teamLogoBase64 = getTeamLogoBase64(team.team);

          return (
            <TableBodyRow key={i} isFirst={i === 0}>
              <IndexCell>
                <IndexCellContent>{i + 1}</IndexCellContent>
              </IndexCell>
              <td>
                <TeamBrandContainer>
                  {teamLogoBase64 && <TeamLogoImg src={teamLogoBase64} />}
                  {team.team || "THE FIELD"}
                </TeamBrandContainer>
              </td>
              <td>{totalGames}</td>
              <td>{winRate}%</td>
              <td>{team.lp}</td>
              <td>{team.players.length} </td>
              <SpacingCell /> {/* Fake cell for spacing */}
              <td>{avgLp}</td>
            </TableBodyRow>
          );
        })}
      </tbody>
    </LeaderboardTable>
  );
};
