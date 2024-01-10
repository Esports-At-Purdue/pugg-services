import { Collection, MongoClient } from "mongodb";
import Ticket from "./models/ticket.ts";
import Bot from "./models/bot.ts";
import Student from "./models/student.ts";
import CustomMessage from "./models/custom.message.ts";
import Starboard from "./models/starboard.ts";

export default class Database {
    public static bots: Collection<Bot>;
    public static tickets: Collection<Ticket>;
    public static students: Collection<Student>;
    public static messages: Collection<CustomMessage>;
    public static starboards: Collection<Starboard>;

    public static async connect() {
        const connectionString = process.env.MONGO_CONNECTION_STRING;
        const client = await new MongoClient(connectionString).connect();
        const db = client.db("Purdue");
        Database.bots = db.collection("bots");
        Database.tickets = db.collection("tickets");
        Database.students = db.collection("students");
        Database.messages = db.collection("messages");
        Database.starboards = db.collection("starboards");
    }
}