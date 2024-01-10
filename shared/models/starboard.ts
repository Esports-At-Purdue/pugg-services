import Database from "../database.ts";
import {NotFoundError} from "../error.ts";

export default class Starboard {
    public readonly id: string;
    public readonly channelId: string;
    public votes: number;

    public constructor(id: string, channelId: string, votes: number) {
        this.id = id;
        this.channelId = channelId;
        this.votes = votes;
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        return await Database.starboards.updateOne(query, update, options);
    }

    public static async fetch(id: string) {
        const query = { id: id };
        const starboard = await Database.starboards.findOne(query);
        if (!starboard) throw new NotFoundError(`Starboard Not Found: ${id}`);
        return starboard;
    }

    public static async fetchAll() {
        return await Database.starboards.find().toArray();
    }
}