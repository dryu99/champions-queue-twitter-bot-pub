module.exports = {
  apps: [
    {
      name: "cq-stream-bot",
      script: "yarn build && yarn start",
      stop_exit_codes: [0], // this doesn't work lol https://github.com/Unitech/pm2/issues/5208
      restart_delay: 15_000,

      // TODO we would use cron if stop_exit_codes worked (we don't want to turn auto_restart off)
      // restart server every day at 10am and 6pm
      // handle server exit for mondays vs other days in app logic
      // cron_restart: '0 10,18 * * *'
    },
  ],
};
