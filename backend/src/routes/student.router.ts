import crypto from "crypto";
import express, {Request, Response} from "express";
import Student from "../../../shared/models/student.ts";
import Protected from "../protected.ts";
import * as fs from "fs";
import axios from "axios";

export default class StudentRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.get("/", Protected(this.fetchAll));
        this.router.get("/:id", Protected(this.fetch));
        this.router.get("/verify/:hash", this.verify);
    }

    private async fetchAll(req: Request, res: Response) {
        const students = await Student.fetchAll();
        res.status(200).send(students);
    }

    private async fetch(req: Request, res: Response) {
        const { id } = req.params;
        const student = await Student.fetch(id);
        res.status(200).send(student);
    }

    private async verify(req: Request, res: Response) {
        const { hash } = req.params;
        const { studentId, roleId, time } = decryptVerificationHash(hash.split("-"));

        if (!time) {
            const html = fs.readFileSync("./html/error.html").toString();
            res.status(400).send(html);
            return;
        }

        if (Date.now() - time > 15 * 60 * 1000) { // 15 (minutes) * 60 (seconds /minute) * 1000 (milliseconds /second)
            const html = fs.readFileSync("./html/expired.html");
            res.status(400).send(html);
            return;
        }

        const student = await Student.fetch(studentId);

        if (!student) {
            const html = fs.readFileSync("./html/error.html").toString();
            res.status(400).send(html);
            return;
        }

        await new Student(student.id, student.username, student.email, true).save();
        await axios.post(`http://localhost:${Bun.env.DISCORD_PORT}/verify/${studentId}/${roleId}`);
        const html = fs.readFileSync("./html/success.html").toString();
        res.status(200).send(html);
    }
}

function decryptVerificationHash(args: string[]) {
    const iv = args[0];
    const content = args[1];
    const ivBuffer = Buffer.from(iv, "hex");
    const contentBuffer = Buffer.from(content, "hex");
    const decipher = crypto.createDecipheriv(Bun.env.CYPHER, Bun.env.AUTHORIZATION, ivBuffer);
    const buffers = [ decipher.update(contentBuffer), decipher.final() ];
    const decryption = Buffer.concat(buffers).toString().split("-");
    const studentId = decryption[0];
    const roleId = decryption[1];
    const time = Number.parseInt(decryption[2]);
    return { studentId: studentId, roleId: roleId, time: time };
}