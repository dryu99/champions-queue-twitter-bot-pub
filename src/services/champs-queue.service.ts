import dayjs from "dayjs";
import { Region } from "../types";

export default class ChampsQueueService {
  public static readonly CQ_START_HOUR = 16;
  public static readonly CQ_START_HOUR_EU = 16;
  public static readonly CQ_END_HOUR = 23;
  public static readonly CQ_CURR_PATCH = "15.1";
  public static readonly CQ_CURR_SEASON_TEXT = "";
  // public static readonly CQ_CURR_SPLIT_TEXT = "Split 1";
  public static readonly CQ_CURR_SPLIT_DATE_DATA = {
    year: 2024,
    month: 10,
    date: 16,
  };

  public static getSplitDay() {
    let currDate = dayjs().tz();
    const splitStartDate = dayjs()
      .tz()
      .year(this.CQ_CURR_SPLIT_DATE_DATA.year)
      .month(this.CQ_CURR_SPLIT_DATE_DATA.month)
      .date(this.CQ_CURR_SPLIT_DATE_DATA.date)
      .hour(0)
      .minute(0)
      .millisecond(0);

    // account for fn calls past midnight
    if (currDate.hour() >= 0 && currDate.hour() <= this.CQ_END_HOUR) {
      currDate = currDate.date(currDate.date() - 1);
    }

    return Math.floor(
      (currDate.toDate().getTime() - splitStartDate.toDate().getTime()) /
        (3600 * 24 * 1000) +
        1
    );
  }

  public static isQueueLive(region: Region): boolean {
    // TODO revert when you figure out times later
    return true;
  }
}
