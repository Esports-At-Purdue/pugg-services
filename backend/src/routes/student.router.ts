import express, {Request, Response} from "express";
import Student from "../../../shared/models/student.ts";
import Protected from "../protected.ts";

export default class StudentRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.get("/", Protected(this.fetchAll));
        this.router.get("/:id", Protected(this.fetch));
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
}