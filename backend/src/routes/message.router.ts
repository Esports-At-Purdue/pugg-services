import express, {Request, Response} from "express";
import Student from "../../../shared/models/student.ts";
import Protected from "../protected.ts";
import CustomMessage from "../../../shared/models/custom.message.ts";

export default class MessageRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.get("/", Protected(this.fetchAll));
        this.router.get("/:botId/:id", Protected(this.fetch));
    }

    private async fetchAll(req: Request, res: Response) {
        const messages = await CustomMessage.fetchAll();
        res.status(200).send(messages);
    }

    private async fetch(req: Request, res: Response) {
        const { id, botId } = req.params;
        const message = await CustomMessage.fetch(id, botId);
        res.status(200).send(message);
    }
}