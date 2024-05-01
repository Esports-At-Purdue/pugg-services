import { APIEmbed, APIMessageComponent, APIAttachment } from "discord.js";
import Database from "../database.ts";
import {NotFoundError} from "../error.ts";

export default class CustomMessage {
    public readonly id:     Id;
    public readonly botId:  Id;
    public content?:        string;
    public embeds?:         APIEmbed[];
    public components?:     APIMessageComponent[];
    public attachments?:    APIAttachment[];

    public constructor(id: Id, botId: Id, content?: string, embeds?: APIEmbed[], components?: APIMessageComponent[], attachments?: APIAttachment[]) {
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
        const result = await Database.messages.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save message: ${this.id}`);
        return this;
    }

    public static async fetch(id: Id, botId: Id) {
        const query = { id: id, botId: botId };
        const message = await Database.messages.findOne(query);
        if (!message) throw new NotFoundError(`CustomMessage Not Found: ${id}`);
        return new CustomMessage(message.id, message.botId, message.content, message.embeds, message.components, message.attachments);
    }

    public static async fetchAll() {
        const messages = await Database.messages.find().toArray();
        return messages.map(message => new CustomMessage(message.id, message.botId, message.content, message.embeds, message.components, message.attachments));
    }
}