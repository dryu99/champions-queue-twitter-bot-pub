import React from "react";
import styled from "styled-components";

const Body = styled.body<{ bgColor: string }>`
  background-color: ${(p) => p.bgColor};
  color: white;
  font-size: 14px;
  font-family: "Bebas Neue", sans-serif;
  margin: 0;
  text-align: center;
`;

const Root = ({
  children,
  bgColor,
}: {
  children: React.ReactNode;
  bgColor: string;
}) => {
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
      <Body bgColor={bgColor}>{children}</Body>
    </html>
  );
};

export default Root;
