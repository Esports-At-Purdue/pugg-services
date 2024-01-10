import Database from "../database.ts";
import {NotFoundError} from "../error.ts";

export default class Student {
    public readonly id: string;
    public username: string;
    public email: string;
    public verified: boolean;

    public constructor(id: string, username: string, email: string, verified: boolean) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.verified = verified;
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        return await Database.students.updateOne(query, update, options);
    }

    public static async fetch(id: string) {
        const query = { id: id };
        const student = await Database.students.findOne(query);
        if (!student) throw new NotFoundError(`Student Not Found: ${id}`);
        return student;
    }

    public static async fetchAll() {
        return await Database.students.find().toArray();
    }
}