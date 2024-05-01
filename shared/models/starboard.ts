import Database from "../database.ts";
import {NotFoundError} from "../error.ts";
import {ButtonComponent, Message} from "discord.js";

export default class Starboard {
    public readonly id:         Id;
    public readonly channelId:  Id;
    public votes:               number;

    public constructor(id: Id, channelId: Id, votes: number) {
        this.id = id;
        this.channelId = channelId;
        this.votes = votes;
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        const result = await Database.starboards.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save starboard: ${this.id}`);
        return this;
    }

    public static async fetch(id: Id) {
        const query = { id: id };
        const starboard = await Database.starboards.findOne(query);
        if (!starboard) throw new NotFoundError(`Starboard Not Found: ${id}`);
        return new Starboard(starboard.id, starboard.channelId, starboard.votes);
    }

    public static async fetchAll() {
        const starboards = await Database.starboards.find().toArray();
        return starboards.map(starboard => new Starboard(starboard.id, starboard.channelId, starboard.votes));
    }

    public static parseNumberFromString(inputString: string) {
        const regex = /\*\*(\d+)\*\*/; // Regular expression to match **number**
        const match = inputString.match(regex);

        if (match && match[1]) {
            return parseInt(match[1], 10);
        } else {
            return 0;
        }
    }

    public static async parseMessage(message: Message) {
        const votes = Starboard.parseNumberFromString(message.content);
        const embeds = message.embeds;

        if (embeds.length < 1) return null;

        const messageUrlButton = message.components[0].components[0] as ButtonComponent;
        const messageUrl = messageUrlButton.url as string;
        const urlParts = messageUrl.split('/');
        const channelId = urlParts[5];
        const messageId = urlParts[6];

        return {
            id: messageId,
            channelId: channelId,
            votes: votes
        }
    }

    public static async  parseOldMessage(message: Message) {
        const votes = Starboard.parseNumberFromString(message.content);
        const embeds = message.embeds;

        if (embeds.length < 1) return null;

        const embed = embeds[embeds.length - 1];
        const fields = embed.fields;

        if (embed.fields.length < 1) return null;

        const field = fields[fields.length - 1];
        const messageUrl = extractDiscordLink(field.value);

        if (!messageUrl) return null;

        const urlParts = messageUrl.split('/');
        const channelId = urlParts[5];
        const messageId = urlParts[6];

        return {
            id: messageId,
            channelId: channelId,
            votes: votes
        }
    }
}

function extractDiscordLink(inputString: string): string | null {
    // Regular expression to match Discord message link
    const discordLinkRegex = /\[Click to jump to message!]\((https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+)\s+/i;

    // Extract Discord link from the input string
    const match = inputString.match(discordLinkRegex);

    // Return the Discord link if found, otherwise return null
    return match ? match[1] : null;
}