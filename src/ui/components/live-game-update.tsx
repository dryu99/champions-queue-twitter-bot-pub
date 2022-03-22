import React from "react";
import styled from "styled-components";
import { MatchTweetData } from "../../services/twitter.service";
import { MatchPlayer } from "../../types";
import { PRIMARY_COLOR } from "../common";
import ChampionsQueueLogoData from "../assets/champions-queue-logo.json";
import TwitchLogoData from "../assets/twitch-logo.json";
import Root from "./root";
import { getTeamLogoBase64, parseTeamName } from "../../lib/team";
import TeamLogo from "./team-logo";

interface LiveGameUpdateProps {
  matchData: MatchTweetData;
}

const Container = styled.div`
  background-color: hsl(205deg 15% 5%);
  border: 3px solid hsl(205deg 15% 15%);
  margin: 0 auto;
  padding-top: 1em;
  width: 700px;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;

  & > img {
    width: 40px;
  }
`;

const HeaderLine = styled.hr`
  width: 587px;
  border-top: none;
  border-bottom: 2px solid white;
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

const Teams = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-family: "Source Sans Pro";
  // width: 650px;
  // background-color: hsl(205deg 15% 5%);
  margin: 0 auto;
  padding: 1em;
`;

const VsContainer = styled.div`
  font-size: 2em;
  font-family: "Bebas Neue", sans-serif;
`;

const LiveGameUpdate: React.FC<LiveGameUpdateProps> = ({ matchData }) => {
  const { match, author } = matchData;
  return (
    <Root>
      <Container>
        <HeaderContainer>
          <img src={ChampionsQueueLogoData.base64} />
          <Header>
            <HighlightText>CHAMPION'S</HighlightText> QUEUE
          </Header>
        </HeaderContainer>
        <SubHeader>
          {/* {season} | Split {split} | {dateOffsetText} ({dateText}) */}
          2022 Spring | Split 2 | Day 4
        </SubHeader>
        <HeaderLine />
        <Teams>
          <Team players={match.blueTeam} teamSide="left" />
          <VsContainer>VS</VsContainer>
          <Team players={match.redTeam} teamSide="right" />
        </Teams>
      </Container>
    </Root>
  );
};

export type TeamSide = "left" | "right";

const TeamContainer = styled.div<{ teamSide: TeamSide }>`
  margin: 0;
  text-align: ${(props) => (props.teamSide === "left" ? "left" : "right")};
  font-size: 1.5em;
`;

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0.5em;
`;

const PlayerName = styled.span`
  width: 18ch; // TODO we should handle case where name is too long + twitch logo should display
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StreamLogoImg = styled.img`
  width: 25px;
`;

interface TeamProps {
  players: MatchPlayer[];
  teamSide: TeamSide;
}

const Team: React.FC<TeamProps> = ({ players, teamSide }) => {
  return (
    <TeamContainer teamSide={teamSide}>
      <div>
        {players.map((player) => {
          const team = parseTeamName(player.summonerNameWithTeam);
          return (
            <PlayerContainer key={player.summonerNameWithTeam}>
              {teamSide === "left" && (
                <TeamLogo teamSide={teamSide} team={team} />
              )}
              <PlayerName>
                {teamSide === "right" && player.isStreaming && (
                  <StreamLogoImg src={TwitchLogoData.base64} />
                )}
                {player.summonerNameWithTeam}
                {teamSide === "left" && player.isStreaming && (
                  <StreamLogoImg src={TwitchLogoData.base64} />
                )}
              </PlayerName>
              {teamSide === "right" && (
                <TeamLogo teamSide={teamSide} team={team} />
              )}
            </PlayerContainer>
          );
        })}
      </div>
    </TeamContainer>
  );
};

export default LiveGameUpdate;
