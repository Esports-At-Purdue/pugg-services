import { Collection, MongoClient } from "mongodb";
import Ticket from "./models/ticket.ts";
import Bot from "./models/bot.ts";
import Student from "./models/student.ts";
import CustomMessage from "./models/message.ts";
import Game from "./models/game.ts";
import Player from "./models/player.ts";
import Session from "./models/session.ts";

export default class Database {
    public static sessions: Collection<Session>
    public static bots: Collection<Bot>;
    public static tickets: Collection<Ticket>;
    public static students: Collection<Student>;
    public static messages: Collection<CustomMessage>;
    public static games: Collection<Game>;
    public static players: Collection<Player>;

    public static async connect() {
        const connectionString = process.env.MONGO_CONNECTION_STRING;
        const client = await new MongoClient(connectionString).connect();
        const db = client.db("pugg");
        Database.bots = db.collection<Bot>("bots");
        Database.tickets = db.collection<Ticket>("tickets");
        Database.students = db.collection<Student>("students");
        Database.messages = db.collection<CustomMessage>("messages");
        Database.games = db.collection<Game>("games");
        Database.players = db.collection<Player>("players");
        Database.sessions = db.collection<Session>("sessions");
    }
}