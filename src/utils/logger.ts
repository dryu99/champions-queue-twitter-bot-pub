import winston from "winston";
import path from "path";
import Config from "./config";

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      filename: path.resolve(__dirname, `../../logs/${Config.NODE_ENV}.log`),
    }),
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
    }),
  ],
});

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

export default logger;
