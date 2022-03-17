import React from "react";
import { MatchTweetData } from "../../services/twitter.service";
import Root from "./root";

interface LiveGameUpdateProps {
  matchData: MatchTweetData;
}

const LiveGameUpdate: React.FC<LiveGameUpdateProps> = ({ matchData }) => {
  return (
    <Root>
      <h1>Champions Queue</h1>
    </Root>
  );
};

export default LiveGameUpdate;
