import winston from "winston";
import Config from "./config";
import DailyRotateFile from "winston-daily-rotate-file";

// TODO would be nice to make this file a class but w/e

const createLogger = (loggerName?: string) => {
  const logger = winston.createLogger({
    transports: [
      new DailyRotateFile({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        filename: `${loggerName ? loggerName + "." : ""}${
          Config.NODE_ENV
        }-%DATE%.log`,
        dirname: "./logs/",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        utc: true,
      }),
    ],
  });

  // only log to console in development
  if (Config.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf((info) => {
            const { timestamp, level, message, ...args } = info;

            const ts = timestamp.slice(0, 19).replace("T", " ");
            return `${ts} [${level}]: ${message} ${
              Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
            }`;
          })
        ),
      })
    );
  }

  return logger;
};

const logger = createLogger();

export const taggedLogger = (loggerName: string) => {
  return {
    debug(message: string, ...meta: any[]) {
      logger.debug(`[${loggerName}] ${message}`, ...meta);
    },
    error(message: string, ...meta: any[]) {
      logger.error(`[${loggerName}] ${message}`, ...meta);
    },
    info(message: string, ...meta: any[]) {
      logger.info(`[${loggerName}] ${message}`, ...meta);
    },
    warn(message: string, ...meta: any[]) {
      logger.warn(`[${loggerName}] ${message}`, ...meta);
    },
  };
};

export const waitForLoggerToComplete = (logger: winston.Logger) => {
  return new Promise((resolve) => {
    logger.on("finish", resolve);
  });
};

export default logger;
