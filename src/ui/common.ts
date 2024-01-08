import styled from "styled-components";
import { Region } from "../types";

export const BG_COLOR = "#323233";
export const PRIMARY_COLOR = "#6560ff";
export const PRIMARY_COLOR_EU = "#30e3bf";

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  padding-top: 0.3em;

  // tODO don't do this lmao
  & > img {
    width: 42.5px;
  }
`;

export const Header = styled.h1`
  font-size: 4em;
  padding-top: 0.1em;
  margin: 0;
`;

export const SubHeader = styled.h2`
  font-size: 1.5em;
  margin-top: -5px;
  margin-bottom: 1em;
`;

export const TableTitle = styled.h2`
  font-size: 2.5em;
  margin: 0;
  margin-bottom: -5px;
`;

export const HighlightText = styled.span<{ region: Region }>`
  color: ${(p) => (p.region === "NA" ? PRIMARY_COLOR : PRIMARY_COLOR_EU)};
`;

export const DownArrowText = styled.span`
  font-size: 0.75em;
`;

export const WaterMark = styled.div`
  text-align: center;
  font-size: 0.75em;
  margin-top: -1em;
`;
