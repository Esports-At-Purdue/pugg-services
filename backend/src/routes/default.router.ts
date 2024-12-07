import express, {Request, Response} from "express";

export default class DefaultRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.get("/", this.get);
    }

    private async get(req: Request, res: Response) {
        console.log("Default Router");
        console.log(`SessionId: ${req.cookies["sessionId"]}`)
        res.sendStatus(200);
    }
}