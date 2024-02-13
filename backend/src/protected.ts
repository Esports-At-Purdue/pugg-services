import { Request, Response } from "express";
import {NotFoundError} from "../../shared/error.ts";
import {User} from "discord.js";

export default function Protected(controller: (req: Request, res: Response) => Promise<void>) {
    return async function(req: Request, res: Response) {
        try {
            if (!req.isAuthenticated()) {
                res.sendStatus(403);
                return;
            }

            //const user = req.user as User;

            await controller(req, res);
        } catch (error) {
            const code = error instanceof NotFoundError ? 404 : 500;
            res.status(code).send(error);
        }
    };
}