import dayjs from "dayjs";
import logger from "../utils/logger";

export default class ChampsQueueService {
  public static readonly CQ_START_HOUR = 18;
  public static readonly CQ_START_HOUR_MONDAY = 10;
  public static readonly CQ_END_HOUR = 1;
  public static readonly CQ_CURR_PATCH = "12.5";
  public static readonly CQ_CURR_SEASON_TEXT = "2022 Spring";
  public static readonly CQ_CURR_SPLIT_TEXT = "Split 2";
  public static readonly CQ_CURR_SPLIT_DATE_DATA = {
    year: 2022,
    month: 2,
    date: 14,
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

  public static isQueueLive(): boolean {
    const currDate = dayjs().tz();
    const cqStartHour =
      currDate.day() === 1 ? this.CQ_START_HOUR_MONDAY : this.CQ_START_HOUR;
    const result =
      currDate.hour() >= cqStartHour || // 10am or 6pm - 12am
      (currDate.hour() >= 0 && currDate.hour() <= this.CQ_END_HOUR); // 12am - 1am

    logger.info("isChampsQueueLive", {
      currDate: currDate.format("MM/DD/YYYY HH:mm z"),
      cqStartHour,
      isChampsQueueLive: result,
    });

    return result;
  }
}
