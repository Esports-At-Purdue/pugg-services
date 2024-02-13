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
        const result = await Database.tickets.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save ticket: ${this.channelId}`);
        return this;
    }

    public static async fetch(channelId: string) {
        const query = { channelId: channelId };
        const ticket = await Database.tickets.findOne(query);
        if (!ticket) throw new NotFoundError(`Ticket Not Found: ${channelId}`);
        return new Ticket(ticket.channelId, ticket.ownerId, ticket.reason, ticket.content, ticket.status);
    }

    public static async fetchAll() {
        const tickets = await Database.tickets.find().toArray();
        return tickets.map(ticket => new Ticket(ticket.channelId, ticket.ownerId, ticket.reason, ticket.content, ticket.status));
    }

    public static async fetchByOwner(ownerId: string) {
        const query = { ownerId: ownerId };
        const tickets = await Database.tickets.find(query).toArray();
        return tickets.map(ticket => new Ticket(ticket.channelId, ticket.ownerId, ticket.reason, ticket.content, ticket.status));
    }
}

export enum TicketStatus {
    Closed,
    Open,
}