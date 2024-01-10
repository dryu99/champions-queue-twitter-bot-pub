import React from "react";
import styled from "styled-components";
import ChampionsQueueLogoData from "../assets/champions-queue-logo.json";
import {
  BG_COLOR,
  Header,
  HeaderContainer,
  HighlightText,
  SubHeader,
  TableTitle,
} from "../common";

import ChampsQueueService from "../../services/champs-queue.service";
import { LpGainLeaderboardPlayer, Region } from "../../types";
import { LpGainPlayerTable } from "./lp-gain-table";
import Root from "./root";

const FootnoteContainer = styled.div`
  font-family: "Source Sans Pro";
  font-size: 1.2em;
  margin-bottom: 0.75em;
  margin-top: -0.3em;
`;

const WaterMark = styled.div`
  text-align: center;
  font-size: 1.5em;
`;

// TODO include logos (have to download them somewhere)
interface LpGainLeaderboardProps {
  players: LpGainLeaderboardPlayer[];
  region: Region;
}

const LpGainLeaderboard: React.FC<LpGainLeaderboardProps> = ({
  players,
  region,
}) => {
  return (
    <Root bgColor={BG_COLOR}>
      <HeaderContainer>
        <img src={ChampionsQueueLogoData[region].base64} />
        <Header>
          <HighlightText region={region}>CHAMPIONS</HighlightText> QUEUE
        </Header>
      </HeaderContainer>
      <SubHeader>
        {/* {region === "NA" ? "🇺🇸" : "🇪🇺"} |{" "} */}
        {ChampsQueueService.CQ_CURR_SEASON_TEXT} | Day{" "}
        {ChampsQueueService.getSplitDay()} | Patch{" "}
        {ChampsQueueService.CQ_CURR_PATCH}
      </SubHeader>
      <TableTitle>Top Climbers of the Day</TableTitle>
      <LpGainPlayerTable players={players} />
      {/* <FootnoteContainer>
        Ties are broken on Win % → Games → Rank Gain
      </FootnoteContainer> */}
      <WaterMark>@ChampsQueueBot</WaterMark>
    </Root>
  );
};

export default LpGainLeaderboard;
