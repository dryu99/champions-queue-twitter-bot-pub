import dayjs from "dayjs";
import advanced from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Region } from "../types";

export const initApp = (region: Region) => {
  if (region === "NA") {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(advanced);
    dayjs.tz.setDefault("America/Los_Angeles");
  } else if (region === "EU") {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(advanced);
    dayjs.tz.setDefault("Europe/Berlin");
  } else {
    throw new Error("invalid region: " + region);
  }
};
