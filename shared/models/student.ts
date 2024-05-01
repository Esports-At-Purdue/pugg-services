import Database from "../database.ts";

export default class Student {
    public readonly id: Id;
    public username:    string;
    public email:       string;
    public verified:    boolean;

    public constructor(id: Id, username: string, email: string, verified: boolean) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.verified = verified;
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        const result = await Database.students.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save student: ${this.id}`);
        return this;
    }

    public static async fetch(id: Id) {
        const query = { id: id };
        const student = await Database.students.findOne(query);
        if (student) return new Student(student.id, student.username, student.email, student.verified);
    }

    public static async fetchAll() {
        const students = await Database.students.find().toArray();
        return students.map(student => new Student(student.id, student.username, student.email, student.verified));
    }
}