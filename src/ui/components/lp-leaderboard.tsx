import React from "react";
import styled from "styled-components";
import ChampsQueueService from "../../services/champs-queue.service";
import { LeaderboardPlayer, Region } from "../../types";
import ChampionsQueueLogoData from "../assets/champions-queue-logo.json";
import {
  BG_COLOR,
  Header,
  HeaderContainer,
  HighlightText,
  SubHeader,
  TableTitle,
} from "../common";
import { LpPlayerTable } from "./lp-table";
import Root from "./root";

const TeamLogoImg = styled.img`
  display: inline-block;
  margin-right: 0.4em;
  width: 40px;
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
interface LpLeaderboardProps {
  players: LeaderboardPlayer[];
  region: Region;
}

const LpLeaderboard: React.FC<LpLeaderboardProps> = ({ players, region }) => {
  return (
    <Root bgColor={BG_COLOR}>
      <HeaderContainer>
        <img src={ChampionsQueueLogoData.NA.base64} />
        <Header>
          <HighlightText region={"NA"}>CHAMPIONS</HighlightText> QUEUE
        </Header>
      </HeaderContainer>
      <SubHeader>
        {region === "NA" ? "🇺🇸" : "🇪🇺"} |{" "}
        {ChampsQueueService.CQ_CURR_SEASON_TEXT} | Day{" "}
        {ChampsQueueService.getSplitDay()} | Patch{" "}
        {ChampsQueueService.CQ_CURR_PATCH}
      </SubHeader>
      <TeamTitleContainer>
        <TableTitle>Current Standings</TableTitle>
      </TeamTitleContainer>
      <LpPlayerTable players={players} />
      <div style={{ marginTop: "8px", fontSize: "1.3em" }}>
        <div>@ChampQueueWard</div>
      </div>
    </Root>
  );
};

export default LpLeaderboard;
