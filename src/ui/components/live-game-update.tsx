import React from "react";
import styled from "styled-components";
import { MatchTweetData } from "../../services/twitter.service";
import { MatchPlayer } from "../../types";
import Root from "./root";

interface LiveGameUpdateProps {
  matchData: MatchTweetData;
}

const Teams = styled.div`
  display: flex;
  justify-content: center;
`;

const LiveGameUpdate: React.FC<LiveGameUpdateProps> = ({ matchData }) => {
  const { match, author } = matchData;
  return (
    <Root>
      <h1>Champions Queue</h1>
      <Teams>
        <Team players={match.blueTeam} teamId={1} />
        <Team players={match.redTeam} teamId={2} />
      </Teams>
    </Root>
  );
};

const TeamContainer = styled.div`
  margin: 0 1em;
`;

interface TeamProps {
  players: MatchPlayer[];
  teamId: number;
}

const Team: React.FC<TeamProps> = ({ players, teamId }) => {
  return (
    <TeamContainer>
      <h2>Team {teamId}</h2>
      {players.map((player) => (
        <div key={player.summonerNameWithTeam}>
          {player.summonerNameWithTeam}
        </div>
      ))}
    </TeamContainer>
  );
};

export default LiveGameUpdate;
