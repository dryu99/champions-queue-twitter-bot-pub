import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import React, { Attributes, FunctionComponent } from "react";

const buildComponentHtml = <P extends {}>(
  component: FunctionComponent<P>,
  props: (Attributes & P) | null
): string => {
  const styleSheet = new ServerStyleSheet();
  const html = renderToString(
    styleSheet.collectStyles(React.createElement(component, props))
  );

  const styleTags = styleSheet.getStyleTags();

  // we search for "<html><head>" instead of just "<head>" to avoid running into bad collisions
  const styledHtml = html.replace("<html><head>", "<html><head>" + styleTags);

  return styledHtml;
};

const HtmlService = {
  buildComponentHtml,
};

export default HtmlService;
