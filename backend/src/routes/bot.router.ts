import express, {Request, Response} from "express";
import Bot from "../../../shared/models/bot.ts";
import Protected from "../protected.ts";

export default class BotRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.get("/", Protected(this.fetchAll));
        this.router.get("/:id", Protected(this.fetch));
    }

    private async fetchAll(req: Request, res: Response) {
        const bots = await Bot.fetchAll();
        res.status(200).send(bots);
    }

    private async fetch(req: Request, res: Response) {
        const { id } = req.params;
        const bot = await Bot.fetch(id);
        res.status(200).send(bot);
    }
}