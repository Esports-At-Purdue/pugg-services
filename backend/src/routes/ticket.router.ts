import express, {Request, Response} from "express";
import Ticket from "../../../shared/models/ticket.ts";
import Protected from "../protected.ts";

export default class TicketRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.get("/", Protected(this.fetchAll));
        this.router.get("/:id", Protected(this.fetch));
        this.router.get("/owner/:id", Protected(this.fetchByOwner));
    }

    private async fetchAll(req: Request, res: Response) {
        const tickets = await Ticket.fetchAll();
        res.status(200).send(tickets);
    }

    private async fetch(req: Request, res: Response) {
        const { id } = req.params;
        const ticket = await Ticket.fetch(id);
        res.status(200).send(ticket);
    }

    private async fetchByOwner(req: Request, res: Response) {
        const { id } = req.params;
        const tickets = await Ticket.fetchByOwner(id);
        res.status(200).send(tickets);
    }
}