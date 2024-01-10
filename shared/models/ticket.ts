import Database from "../database.ts";
import {NotFoundError} from "../error.ts";

export default class Ticket {
    public readonly channelId: string;
    public readonly ownerId: string;
    public readonly reason: string;
    public content: TicketContent[];
    public status: TicketStatus;

    public constructor(channelId: string, ownerId: string, reason: string, content: TicketContent[], status: TicketStatus) {
        this.channelId = channelId;
        this.ownerId = ownerId;
        this.reason = reason;
        this.content = content;
        this.status = status;
    }

    public async save() {
        const query = { channelId: this.channelId };
        const update = { $set: this };
        const options = { upsert: true };
        return await Database.tickets.updateOne(query, update, options);
    }

    public static async fetch(channelId: string) {
        const query = { channelId: channelId };
        const ticket = await Database.tickets.findOne(query);
        if (!ticket) throw new NotFoundError(`Ticket Not Found: ${channelId}`);
        return ticket;
    }

    public static async fetchAll() {
        return await Database.tickets.find().toArray();
    }

    public static async fetchByOwner(ownerId: string) {
        const query = { ownerId: ownerId };
        return await Database.tickets.find(query).toArray();
    }
}

export enum TicketStatus {
    Closed,
    Open,
}