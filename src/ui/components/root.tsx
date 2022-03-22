import React from "react";
import styled from "styled-components";
import { BG_COLOR } from "../common";

const Body = styled.body`
  background-color: ${BG_COLOR};
  color: white;
  font-size: 14px;
  font-family: "Bebas Neue", sans-serif;
  margin-top: 1.25em;
  text-align: center;
`;

const WaterMark = styled.div`
  text-align: center;
  font-size: 1.5em;
`;

const Root: React.FC = ({ children }) => {
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Bebas+Neue"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Source+Sans+Pro"
        />
      </head>
      <Body>
        {children}
        {/* <WaterMark>@ChampionsQueue</WaterMark> */}
        {/* TODO include twitter logo */}
      </Body>
    </html>
  );
};

export default Root;
