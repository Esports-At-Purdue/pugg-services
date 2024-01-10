import Database from "../database.ts";
import {NotFoundError} from "../error.ts";
import Axios from "axios";

export default class Bot {
    public readonly id: string;
    public readonly name: BotName;
    public readonly settings: BotSettings;

    public constructor(id: string, name: BotName, settings: BotSettings) {
        this.id = id;
        this.name = name;
        this.settings = settings;
    }

    public get axios() {
        return Axios.create({
            baseURL: Bun.env.DISCORD_URL,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${this.settings.token}`
            }
        })
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        return await Database.bots.updateOne(query, update, options);
    }

    public static async fetch(id: string) {
        const query = { id: id };
        const bot = await Database.bots.findOne(query);
        if (!bot) throw new NotFoundError(`Bot Not Found: ${id}`);
        return bot;
    }

    public static async fetchAll() {
        return await Database.bots.find().toArray();
    }
}

export enum BotName {
    CSGO = "csgo",
    CSMemers = "csmemers",
    Fortnite = "fortnite",
    Math = "math",
    Overwatch = "overwatch",
    Pugg = "pugg",
    Siege = "siege",
    Valorant = "valorant"
}