import * as Sentry from "@sentry/node";
import Config from "../utils/config";

Sentry.init({
  dsn: Config.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: Config.NODE_ENV,
});

export default class BugService {
  public static captureException(err: any) {
    Sentry.captureException(err);
  }

  public static captureMessage(message: string) {
    Sentry.captureMessage(message);
  }

  public static async close(ms: number) {
    return Sentry.close(ms);
  }
}
