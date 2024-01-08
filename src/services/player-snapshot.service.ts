import mongoose from "mongoose";
import { Region } from "../types";

export interface PlayerSnapshot {
  summonerNameWithTeam: string;
  lp: number;
  wins: number;
  losses: number;
  date: Date; // represents midnight of scraped date
  region: Region;
}

export interface NewPlayerSnapshot extends PlayerSnapshot {}

const PlayerSnapshotSchema = new mongoose.Schema<PlayerSnapshot>({
  summonerNameWithTeam: { type: String, required: true },
  lp: { type: Number, required: true },
  wins: { type: Number, required: true },
  losses: { type: Number, required: true },
  region: { type: String, required: true },
  date: { type: Date, required: true },
});

PlayerSnapshotSchema.set("timestamps", true);

const PlayerSnapshotModel = mongoose.model(
  "PlayerSnapshot",
  PlayerSnapshotSchema
);

export class PlayerSnapshotService {
  public static async addMany(newEntries: NewPlayerSnapshot[]) {
    return PlayerSnapshotModel.insertMany(newEntries);
  }
}
