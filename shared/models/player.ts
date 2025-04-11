import Database from "../database.ts";
import {NotFoundError} from "../error.ts";

// wassup gang

export default class Player {
    public readonly id: string
    public readonly username: string;
    public readonly stats: PlayerStats;

    public constructor(id: string, username: string, stats: PlayerStats = new PlayerStats()) {
        this.id = id;
        this.username = username;
        this.stats = stats;
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        const result = await Database.players.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save player: ${this.id}`);
        return this;
    }

    public static async fetch(id: Id) {
        const query = { id: id };
        const player = await Database.players.findOne(query);
        if (!player) throw new NotFoundError(`Player Not Found: ${id}`);
        return new Player(player.id, player.username, player.stats);
    }

    public static async fetchAll() {
        const players = await Database.players.find().toArray();
        return players.map(player => new Player(player.id, player.username, player.stats));
    }

    public getEloChange(teamElo: number, opponentElo: number, opponentScore: number, isWinner: boolean) {
        const c = 1 + (10 - Math.min(opponentScore, 12)) / 50;
        const b = 1 + (opponentElo - this.stats.elo) / opponentElo;
        if (isWinner) {
            const a = 25 * (this.stats.acs / 200) * (1 - (teamElo - opponentElo) / teamElo);
            return Math.round(a * b * c);
        } else {
            const a = 25 * (150 / this.stats.acs) * (1 - (opponentElo - teamElo) / teamElo);
            return Math.round(a * b * c);
        }
    }

    public getEmote() {
        const elo = this.stats.elo;
        if (elo >= 1100) return Emote.Radiant
        if (elo >= 1000) return Emote.ImmortalIII;
        if (elo >= 900) return Emote.ImmortalII;
        if (elo >= 800) return Emote.ImmortalI;
        if (elo >= 770) return Emote.AscendantIII;
        if (elo >= 730) return Emote.AscendantII;
        if (elo >= 700) return Emote.AscendantI;
        if (elo >= 670) return Emote.DiamondIII;
        if (elo >= 630) return Emote.DiamondII;
        if (elo >= 600) return Emote.DiamondI;
        if (elo >= 570) return Emote.PlatinumIII;
        if (elo >= 530) return Emote.PlatinumII;
        if (elo >= 500) return Emote.PlatinumI;
        if (elo >= 470) return Emote.GoldIII;
        if (elo >= 430) return Emote.GoldII;
        if (elo >= 400) return Emote.GoldI;
        if (elo >= 370) return Emote.SilverIII;
        if (elo >= 330) return Emote.SilverII;
        if (elo >= 300) return Emote.SilverI;
        if (elo >= 270) return Emote.BronzeIII;
        if (elo >= 230) return Emote.BronzeII;
        if (elo >= 200) return Emote.BronzeI;
        if (elo >= 150) return Emote.IronIII;
        if (elo >= 100) return Emote.IronII;
        return Emote.IronI;
    }
}

class PlayerStats {
    public games: number;
    public wins: number;
    public losses: number;
    public elo: number;
    public acs: number;

    public constructor(games: number = 0, wins: number = 0, losses: number = 0, elo: number = 500, acs: number = 0) {
        this.games = games;
        this.wins = wins
        this.losses = losses;
        this.elo = elo;
        this.acs = acs;
    }
}

enum Emote {
    Radiant = "1171284215090921603",
    ImmortalIII = "1171284097197420594",
    ImmortalII = "1171284066369290340",
    ImmortalI = "1171284019174969425",
    AscendantIII = "1171283869367021689",
    AscendantII = "1171283856377249883",
    AscendantI = "1171283842343116800",
    DiamondIII = "1171283763544735794",
    DiamondII = "1171283748386521192",
    DiamondI = "1171283715587047464",
    PlatinumIII = "1171283684490477618",
    PlatinumII = "1171283671966285895",
    PlatinumI = "1171283659186249790",
    GoldIII = "1171283643264679976",
    GoldII = "1171283631038267462",
    GoldI = "1171283618497318943",
    SilverIII = "1171283599589388359",
    SilverII = "1171283585173565550",
    SilverI = "1171283551308742740",
    BronzeIII = "1171283527933902908",
    BronzeII = "1171283513484525661",
    BronzeI = "1171283497302896660",
    IronIII = "1171283462355943475",
    IronII = "1171283398199877632",
    IronI = "1171283369972203592",
}