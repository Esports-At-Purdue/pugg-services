import Player from "./player.ts";
import Database from "../database.ts";
import {NotFoundError} from "../error.ts";

export default class Game {
    public readonly id: number;
    public queue: string;
    public teams: Team[];
    public players: Player[];
    public cancelled: boolean;

    public constructor(id: number, queue: string, players: Player[], teams: Team[] = [], cancelled: boolean = false) {
        this.id = id;
        this.queue = queue;
        this.teams = teams;
        this.players = players;
        this.cancelled = cancelled
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        const result = await Database.games.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save game: ${this.id}`);
        return this;
    }

    public static async fetch(id: number) {
        const query = { id: id };
        const game = await Database.games.findOne(query);
        if (!game) throw new NotFoundError(`Player Not Found: ${id}`);
        const players = game.players.map(player => new Player(player.id, player.username, player.stats));
        const teams = game.teams.map(team => {
            const players = team.players.map(player => new Player(player.id, player.username, player.stats));
            return new Team(players, team.elo, team.score, team.isWinner);
        });
        return new Game(game.id, game.queue, players, teams);
    }

    public static async fetchAll() {
        const games = await Database.games.find().toArray();
        return games.map(game => {
            const players = game.players.map(player => new Player(player.id, player.username, player.stats));
            const teams = game.teams.map(team => new Team(team.players, team.elo, team.score, team.isWinner));
            return new Game(game.id, game.queue, players, teams, game.cancelled)
        });
    }
}

export class Team {
    public players: Player[];
    public score: number;
    public elo: number;
    public isWinner: boolean;

    public constructor(players: Player[] = [], elo: number = 0,  score: number = -1, isWinner: boolean = false) {
        this.players = players;
        this.score = score;
        this.elo = elo;
        this.isWinner = isWinner;
    }

    public getAverageElo() {
        return this.players
            .map(player => player.stats.elo)
            .reduce((a, b) => a + b) / this.players.length;
    }
}