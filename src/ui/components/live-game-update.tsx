import React from "react";
import styled from "styled-components";
import { MatchTweetData } from "../../services/twitter.service";
import { MatchPlayer } from "../../types";
import { PRIMARY_COLOR } from "../common";
import ChampionsQueueLogoData from "../assets/champions-queue-logo.json";
import Root from "./root";

interface LiveGameUpdateProps {
  matchData: MatchTweetData;
}

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;

  // tODO don't do this lmao
  & > img {
    width: 40px;
  }
`;

const Header = styled.h1`
  font-size: 3em;
  padding-top: 0.1em;
  margin: 0;
`;

const SubHeader = styled.h2`
  font-size: 1.5em;
  margin-top: -5px;
  margin-bottom: 1em;
`;

const HighlightText = styled.span`
  color: ${PRIMARY_COLOR};
`;

const TableTitle = styled.h2`
  font-size: 2.5em;
  margin: 0;
  margin-bottom: -5px;
`;

const Teams = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-family: "Source Sans Pro";
  width: 600px;
  margin: 0 auto;
`;

const VsContainer = styled.div`
  font-size: 2em;
`;

const LiveGameUpdate: React.FC<LiveGameUpdateProps> = ({ matchData }) => {
  const { match, author } = matchData;
  return (
    <Root>
      <HeaderContainer>
        <img src={ChampionsQueueLogoData.base64} />
        <Header>
          <HighlightText>CHAMPIONS</HighlightText> QUEUE
        </Header>
      </HeaderContainer>
      <SubHeader>
        {/* {season} | Split {split} | {dateOffsetText} ({dateText}) */}
        2022 Spring | Split 2 | Day 4
      </SubHeader>
      <div>
        <Teams>
          <Team players={match.blueTeam} teamSide="left" />
          <VsContainer>VS</VsContainer>
          <Team players={match.redTeam} teamSide="right" />
        </Teams>
      </div>
    </Root>
  );
};

const TeamContainer = styled.div<{ teamSide: "left" | "right" }>`
  margin: 0;
  text-align: ${(props) => (props.teamSide === "left" ? "left" : "right")};
  font-size: 2em;
`;

const TeamHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5em;
`;

const PlayerContainer = styled.div`
  margin-bottom: 0.25em;
  width: 16ch;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

interface TeamProps {
  players: MatchPlayer[];
  teamSide: "left" | "right";
}

const Team: React.FC<TeamProps> = ({ players, teamSide }) => {
  return (
    <TeamContainer teamSide={teamSide}>
      <TeamHeader>Team {teamSide === "left" ? 1 : 2}</TeamHeader>
      <div>
        {players.map((player) => (
          <PlayerContainer key={player.summonerNameWithTeam}>
            {player.summonerNameWithTeam}
          </PlayerContainer>
        ))}
      </div>
    </TeamContainer>
  );
};

export default LiveGameUpdate;
