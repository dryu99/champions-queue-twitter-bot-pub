import { readFileSync } from "fs";
import mongoose from "mongoose";
import { PlayerModel } from "../services/player.service";
import Config from "../utils/config";

const main = async () => {
  await mongoose.connect(Config.ATLAS_URL);

  // use fs to get data from twitch-update-players.json
  const twitchUpdatePlayers = JSON.parse(
    readFileSync("./twitch-update-players.json", {
      encoding: "utf-8",
    })
  );

  for (const player of twitchUpdatePlayers) {
    const playerLcName = player.name.toLowerCase();

    const updatedPlayer = await PlayerModel.findOneAndUpdate(
      { lcSummonerName: playerLcName },
      {
        twitchLink: player.twitchLink,
      },
      { new: true }
    );

    let newPlayer;
    if (!updatedPlayer) {
      newPlayer = await PlayerModel.create({
        summonerName: player.name,
        summonerNameWithTeam: player.name,
        lcSummonerName: playerLcName,
        team: undefined,
        org: undefined,
        summonerId: Math.round(Math.random() * 10000000000),
        league: "UNKNOWN",
        twitchLink: player.twitchLink,
        region: "NA",
        seasonId: -1,
        splitId: -1,
        year: -1,
      });
    }

    console.log({
      updatedPlayer: updatedPlayer?.twitchLink,
      playerLcName,
      newPlayerId: newPlayer?.summonerId,
      newPlayerTwitch: newPlayer?.twitchLink,
    });
  }

  console.log("done");
};

main();
