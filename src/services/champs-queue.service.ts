import dayjs from "dayjs";
import logger from "../utils/logger";

export default class ChampsQueueService {
  public static readonly CQ_START_HOUR = 18;
  public static readonly CQ_START_HOUR_MONDAY = 10;
  public static readonly CQ_END_HOUR = 1;
  public static readonly CQ_CURR_PATCH = "12.5";

  public static isQueueLive(): boolean {
    const currDate = dayjs().tz();
    const cqStartHour =
      currDate.day() === 1 ? this.CQ_START_HOUR_MONDAY : this.CQ_START_HOUR;
    const result =
      currDate.hour() >= cqStartHour || // 10am or 6pm - 12am
      (currDate.hour() >= 0 && currDate.hour() <= this.CQ_END_HOUR); // 12am - 1am

    logger.info("isChampsQueueLive", {
      currDate: currDate.format("MM/DD/YYYY HH:mma z"),
      cqStartHour,
      isChampsQueueLive: result,
    });

    return result;
  }
}
