import React from "react";
import styled from "styled-components";
import { parseTeamName } from "../../lib/team";
import ChampsQueueService from "../../services/champs-queue.service";
import { MatchTweetData } from "../../services/twitter.service";
import { MatchPlayer, Region } from "../../types";
import ChampionsQueueLogoData from "../assets/champions-queue-logo.json";
import TwitchLogoData from "../assets/twitch-logo.json";
import { PRIMARY_COLOR, PRIMARY_COLOR_EU } from "../common";
import RoleLogo from "./role-logo";
import Root from "./root";
import TeamLogo from "./team-logo";

interface LiveGameUpdateProps {
  matchData: MatchTweetData;
}

const Container = styled.div`
  background-color: hsl(205deg 15% 5%);
  // border: 3px solid hsl(205deg 15% 15%);
  margin: 0 auto;
  padding-top: 1em;
  width: 600px;
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
  width: 556px;
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

const HighlightText = styled.span<{ region: Region }>`
  color: ${(p) => (p.region === "NA" ? PRIMARY_COLOR : PRIMARY_COLOR_EU)};
`;

const Teams = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-family: "Source Sans Pro";
  margin: 0 auto;
  padding: 0.5em 1em 1em 1em;
`;

const VsContainer = styled.div`
  font-size: 3em;
  font-family: "Bebas Neue", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VsLine = styled.div`
  border-left: 2px solid white;
  height: 82.5px;
`;

const VsChar = styled.div`
  margin: 0 0.15em;
`;

const WaterMark = styled.div`
  text-align: center;
  font-size: 0.75em;
  margin-top: -1em;
`;

const LiveGameUpdate: React.FC<LiveGameUpdateProps> = ({ matchData }) => {
  const { match, authorUrl, region } = matchData;
  return (
    <Root bgColor={"hsl(205deg 15% 5%)"}>
      <Container>
        <HeaderContainer>
          <img src={ChampionsQueueLogoData[region].base64} />
          <Header>
            <HighlightText region={region}>CHAMPIONS</HighlightText> QUEUE
          </Header>
        </HeaderContainer>
        <SubHeader>
          {region === "NA" ? "🇺🇸" : "🇪🇺"} |{" "}
          {ChampsQueueService.CQ_CURR_SEASON_TEXT} | Day{" "}
          {ChampsQueueService.getSplitDay()} | Patch{" "}
          {ChampsQueueService.CQ_CURR_PATCH}
        </SubHeader>
        <HeaderLine />
        <Teams>
          <Team players={match.blueTeam} teamSide="left" />
          <VsContainer>
            <VsLine />
            <VsChar>vs</VsChar>
            <VsLine />
          </VsContainer>
          <Team players={match.redTeam} teamSide="right" />
        </Teams>
        <WaterMark>@ChampQueueWard</WaterMark>
      </Container>
    </Root>
  );
};

export type TeamSide = "left" | "right";

const RegionSpan = styled.span<{ region: Region }>`
  color: ${(props) => (props.region === "NA" ? "red" : "blue")};
`;

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
        {players.map((player, i) => {
          const team = parseTeamName(player.summonerNameWithTeam);
          return (
            <PlayerContainer key={player.summonerNameWithTeam}>
              {teamSide === "left" && (
                <RoleLogo teamSide={teamSide} roleIndex={i} />
              )}
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
              {teamSide === "right" && (
                <RoleLogo teamSide={teamSide} roleIndex={i} />
              )}
            </PlayerContainer>
          );
        })}
      </div>
    </TeamContainer>
  );
};

export default LiveGameUpdate;
