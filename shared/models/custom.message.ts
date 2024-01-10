import { APIEmbed, APIMessageComponent, APIAttachment } from "discord.js";
import Database from "../database.ts";
import {NotFoundError} from "../error.ts";

export default class CustomMessage {
    public readonly id: string;
    public readonly botId: string;
    public content?: string;
    public embeds?: APIEmbed[];
    public components?: APIMessageComponent[];
    public attachments?: APIAttachment[];

    public constructor(id: string, botId: string, content: string, embeds: [], components: [], attachments: []) {
        this.id = id;
        this.botId = botId;
        this.content = content;
        this.embeds = embeds;
        this.components = components;
        this.attachments = attachments;
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        return await Database.messages.updateOne(query, update, options);
    }

    public static async fetch(id: string, botId: string) {
        const query = { id: id, botId: botId };
        const customMessage = await Database.messages.findOne(query);
        if (!customMessage) throw new NotFoundError(`CustomMessage Not Found: ${id}`);
        return customMessage;

    }

    public static async fetchAll() {
        return await Database.messages.find().toArray();
    }
}