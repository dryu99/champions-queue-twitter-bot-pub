import mongoose from "mongoose";
import { DbPlayer, PlayerModel } from "../services/player.service";
import Config from "../utils/config";

const players = [
  {
    name: "Bin",
    team: "BLG",
    twitch: null,
    twitter: "BLGBinGe",
  },
  {
    name: "Wei",
    team: "BLG",
    twitch: null,
    twitter: null,
  },
  {
    name: "knight",
    team: "BLG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Elk",
    team: "BLG",
    twitch: null,
    twitter: null,
  },
  {
    name: "ON",
    team: "BLG",
    twitch: null,
    twitter: null,
  },
  {
    name: "BigWei",
    team: "BLG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Xiasu",
    team: "BLG",
    twitch: null,
    twitter: "roarSpicy",
  },
  {
    name: "Kingen",
    team: "DK",
    twitch: "hwang6595",
    twitter: "Kingen0311",
  },
  {
    name: "Lucid",
    team: "DK",
    twitch: "dydgur0128",
    twitter: null,
  },
  {
    name: "ShowMaker",
    team: "DK",
    twitch: "gjtn9664",
    twitter: null,
  },
  {
    name: "Aiming",
    team: "DK",
    twitch: "gkakfk72",
    twitter: null,
  },
  {
    name: "Moham",
    team: "DK",
    twitch: null,
    twitter: "lol_Moham",
  },
  {
    name: "Zefa",
    team: "DK",
    twitch: null,
    twitter: null,
  },
  {
    name: "Bubbling",
    team: "DK",
    twitch: "lolbubbling",
    twitter: null,
  },
  {
    name: "Ssong",
    team: "DK",
    twitch: null,
    twitter: "coachssong",
  },
  {
    name: "Bwipo",
    team: "FLY",
    twitch: "bwipolol",
    twitter: "Bwipo",
  },
  {
    name: "Inspired",
    team: "FLY",
    twitch: "inspiredlol_",
    twitter: "Inspiredlol",
  },
  {
    name: "Quad",
    team: "FLY",
    twitch: null,
    twitter: "midQuad",
  },
  {
    name: "Massu",
    team: "FLY",
    twitch: "blaccmassu",
    twitter: "Massu036",
  },
  {
    name: "Busio",
    team: "FLY",
    twitch: "busiolol",
    twitter: "Busio",
  },
  {
    name: "Nukeduck",
    team: "FLY",
    twitch: "nukeducklol",
    twitter: "nukeduck",
  },
  {
    name: "Mithy",
    team: "FLY",
    twitch: "tsm_mithylol",
    twitter: "mithygg",
  },
  {
    name: "Oscarinin",
    team: "FNC",
    twitch: "Oscarinin",
    twitter: "OscarininXD",
  },
  {
    name: "Razork",
    team: "FNC",
    twitch: "razorklol",
    twitter: "RazorkLoL",
  },
  {
    name: "Humanoid",
    team: "FNC",
    twitch: "humanoiidd",
    twitter: "Humanoidlol",
  },
  {
    name: "Noah",
    team: "FNC",
    twitch: "krnoah7",
    twitter: "Noah_lol1004",
  },
  {
    name: "Jun",
    team: "FNC",
    twitch: null,
    twitter: "JunLoL2024",
  },
  {
    name: "Nightshare",
    team: "FNC",
    twitch: "nightsharre",
    twitter: "Nightsharre",
  },
  {
    name: "Gaax",
    team: "FNC",
    twitch: "gaax__",
    twitter: "Gaax__",
  },
  {
    name: "BrokenBlade",
    team: "G2",
    twitch: "brokenblade",
    twitter: "BrokenBlade",
  },
  {
    name: "Yike",
    team: "G2",
    twitch: "yikelol",
    twitter: "Yikelol",
  },
  {
    name: "Caps",
    team: "G2",
    twitch: "caps",
    twitter: "G2Caps",
  },
  {
    name: "Hans Sama",
    team: "G2",
    twitch: "hanssama",
    twitter: "Hanssama",
  },
  {
    name: "Mikyx",
    team: "G2",
    twitch: "m1kyx",
    twitter: "mikyx",
  },
  {
    name: "Dylan Falco",
    team: "G2",
    twitch: null,
    twitter: "dylanfalcolol",
  },
  {
    name: "Rodrigo",
    team: "G2",
    twitch: null,
    twitter: "rodrigo_rlt",
  },
  {
    name: "Kiaya",
    team: "GAM",
    twitch: null,
    twitter: null,
  },
  {
    name: "Levi",
    team: "GAM",
    twitch: null,
    twitter: "lolLevi97",
  },
  {
    name: "Emo",
    team: "GAM",
    twitch: null,
    twitter: null,
  },
  {
    name: "EasyLove",
    team: "GAM",
    twitch: null,
    twitter: null,
  },
  {
    name: "Elio",
    team: "GAM",
    twitch: null,
    twitter: null,
  },
  {
    name: "Archie",
    team: "GAM",
    twitch: null,
    twitter: null,
  },
  {
    name: "Hype",
    team: "GAM",
    twitch: null,
    twitter: null,
  },
  {
    name: "Kiin",
    team: "GEN",
    twitch: null,
    twitter: "kiin_99",
  },
  {
    name: "Canyon",
    team: "GEN",
    twitch: null,
    twitter: null,
  },
  {
    name: "Chovy",
    team: "GEN",
    twitch: null,
    twitter: "j1hu1V_chovy",
  },
  {
    name: "Peyz",
    team: "GEN",
    twitch: null,
    twitter: "peyz05",
  },
  {
    name: "Lehends",
    team: "GEN",
    twitch: null,
    twitter: "lehends_lol",
  },
  {
    name: "KIM",
    team: "GEN",
    twitch: null,
    twitter: null,
  },
  {
    name: "Helper",
    team: "GEN",
    twitch: "luckygyj",
    twitter: "lol_Helper",
  },
  {
    name: "Doran",
    team: "HLE",
    twitch: "choi88255",
    twitter: "doran_choi",
  },
  {
    name: "Peanut",
    team: "HLE",
    twitch: "lol_peanut",
    twitter: "lolPeanut98",
  },
  {
    name: "Zeka",
    team: "HLE",
    twitch: "gun6028",
    twitter: "gun8952",
  },
  {
    name: "Viper",
    team: "HLE",
    twitch: "pdh1919",
    twitter: "HLEviper",
  },
  {
    name: "Delight",
    team: "HLE",
    twitch: "dbghkswnd",
    twitter: null,
  },
  {
    name: "DanDy",
    team: "HLE",
    twitch: null,
    twitter: "_yDnaD",
  },
  {
    name: "Mowgli",
    team: "HLE",
    twitch: null,
    twitter: "mowgli_lol",
  },
  {
    name: "Bibra",
    team: "HLE",
    twitch: null,
    twitter: null,
  },
  {
    name: "Zika",
    team: "LNG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Weiwei",
    team: "LNG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Scout",
    team: "LNG",
    twitch: null,
    twitter: null,
  },
  {
    name: "GALA",
    team: "LNG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Hang",
    team: "LNG",
    twitch: null,
    twitter: null,
  },
  {
    name: "U",
    team: "LNG",
    twitch: null,
    twitter: null,
  },
  {
    name: "DynAmIte",
    team: "LNG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Myrwn",
    team: "MAD",
    twitch: "myrwnn",
    twitter: "Myrwnn",
  },
  {
    name: "Elyoya",
    team: "MAD",
    twitch: "elyoyalol",
    twitter: "Elyoya_LoL",
  },
  {
    name: "Fresskowy",
    team: "MAD",
    twitch: null,
    twitter: "Fresskowylol",
  },
  {
    name: "Supa",
    team: "MAD",
    twitch: "supa_lol",
    twitter: "Supa_LoL",
  },
  {
    name: "Alvaro",
    team: "MAD",
    twitch: "alvaro710x",
    twitter: "AlVaRo710_",
  },
  {
    name: "Melzhet",
    team: "MAD",
    twitch: null,
    twitter: "Melzhet",
  },
  {
    name: "Zeph",
    team: "MAD",
    twitch: null,
    twitter: "Zeph_LoL",
  },
  {
    name: "Wizer",
    team: "PNG",
    twitch: "TopWizer",
    twitter: "lolwizer",
  },
  {
    name: "CarioK",
    team: "PNG",
    twitch: "carioklol",
    twitter: "Carioklol",
  },
  {
    name: "dyNquedo",
    team: "PNG",
    twitch: "dynquedo1",
    twitter: "dynquedo1",
  },
  {
    name: "TitaN",
    team: "PNG",
    twitch: "titanlol1",
    twitter: "titanlolOficial",
  },
  {
    name: "Kuri",
    team: "PNG",
    twitch: "lol_kuri",
    twitter: "KuriLoL_",
  },
  {
    name: "Sarkis",
    team: "PNG",
    twitch: "sarkislol1",
    twitter: "Sarkislol",
  },
  {
    name: "Xero",
    team: "PNG",
    twitch: null,
    twitter: "painxero1",
  },
  {
    name: "Azhi",
    team: "PSG",
    twitch: "e25286123123",
    twitter: null,
  },
  {
    name: "JunJia",
    team: "PSG",
    twitch: "junjia0610",
    twitter: null,
  },
  {
    name: "Maple",
    team: "PSG",
    twitch: "mapletom",
    twitter: "Maple_Tom1",
  },
  {
    name: "Betty",
    team: "PSG",
    twitch: "betty206046",
    twitter: null,
  },
  {
    name: "Woody",
    team: "PSG",
    twitch: "tona9966",
    twitter: null,
  },
  {
    name: "CorGi",
    team: "PSG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Zero",
    team: "PSG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Zeus",
    team: "T1",
    twitch: null,
    twitter: null,
  },
  {
    name: "Oner",
    team: "T1",
    twitch: null,
    twitter: null,
  },
  {
    name: "Faker",
    team: "T1",
    twitch: null,
    twitter: "faker",
  },
  {
    name: "Gumayusi",
    team: "T1",
    twitch: null,
    twitter: "gumayusi_min",
  },
  {
    name: "Keria",
    team: "T1",
    twitch: null,
    twitter: "T1Keria",
  },
  {
    name: "kkOma",
    team: "T1",
    twitch: "kkoma",
    twitter: null,
  },
  {
    name: "Roach",
    team: "T1",
    twitch: "t1_roach",
    twitter: "RoachLoL",
  },
  {
    name: "Tom",
    team: "T1",
    twitch: null,
    twitter: null,
  },
  {
    name: "Impact",
    team: "TL",
    twitch: "flyqimpact",
    twitter: "Impact",
  },
  {
    name: "UmTi",
    team: "TL",
    twitch: null,
    twitter: "UmTi0602",
  },
  {
    name: "APA",
    team: "TL",
    twitch: "alwaysplanahealol",
    twitter: "alwaysplanahea1",
  },
  {
    name: "Yeon",
    team: "TL",
    twitch: "yeon7lol",
    twitter: "Yeon7lol",
  },
  {
    name: "CoreJJ",
    team: "TL",
    twitch: "corejj",
    twitter: "TLCoreJJ",
  },
  {
    name: "Spawn",
    team: "TL",
    twitch: null,
    twitter: "Spawnlol",
  },
  {
    name: "Reignover",
    team: "TL",
    twitch: null,
    twitter: "TL_Reignover",
  },
  {
    name: "369",
    team: "TES",
    twitch: null,
    twitter: null,
  },
  {
    name: "Tian",
    team: "TES",
    twitch: null,
    twitter: "Gao_Tian_Liang",
  },
  {
    name: "Creme",
    team: "TES",
    twitch: null,
    twitter: null,
  },
  {
    name: "JackeyLove",
    team: "TES",
    twitch: null,
    twitter: "TESJKL1118",
  },
  {
    name: "Meiko",
    team: "TES",
    twitch: null,
    twitter: null,
  },
  {
    name: "Maokai",
    team: "TES",
    twitch: null,
    twitter: null,
  },
  {
    name: "Despa1r",
    team: "TES",
    twitch: null,
    twitter: null,
  },
  {
    name: "Breathe",
    team: "WBG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Tarzan",
    team: "WBG",
    twitch: "tarzan0823",
    twitter: "Tarzan_0823",
  },
  {
    name: "Xiaohu",
    team: "WBG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Light",
    team: "WBG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Crisp",
    team: "WBG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Daeny",
    team: "WBG",
    twitch: null,
    twitter: null,
  },
  {
    name: "Tselin",
    team: "WBG",
    twitch: null,
    twitter: null,
  },
];

async function main() {
  await mongoose.connect(Config.ATLAS_URL);

  for (const player of players) {
    const dbPlayer: Partial<DbPlayer> = {
      summonerName: player.name,
      summonerNameWithTeam: `${player.team} ${player.name}`,
      lcSummonerName: player.name.toLowerCase(),
      team: player.team,
      region: "WORLDS",
    };

    if (player.twitter) {
      dbPlayer.twitterLink = `https://twitter.com/${player.twitter}`;
    }
    if (player.twitch) {
      dbPlayer.twitchLink = `${player.twitch}`;
    }

    try {
      // Check if player already exists
      const existingPlayer = await PlayerModel.findOne({
        lcSummonerName: dbPlayer.lcSummonerName,
      });

      if (existingPlayer) {
        // Update existing player
        await PlayerModel.updateOne(
          { _id: existingPlayer._id },
          { $set: dbPlayer }
        );
        console.log(`Updated player: ${player.name}`);
      } else {
        // Add new player
        await PlayerModel.create(dbPlayer);
        console.log(`Added new player: ${player.name}`);
      }
    } catch (error) {
      console.error(`Error processing player ${player.name}:`, error);
    }
  }

  await mongoose.disconnect();
}

main()
  .then(() => console.log("Player update complete"))
  .catch(console.error);
