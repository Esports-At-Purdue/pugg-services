import express, {Request, Response} from "express";
import Passport from "../../passport.ts";

export default class AuthRouter {
    public readonly router: express.Router;

    public constructor(passport: Passport) {
        this.router = express.Router();
        this.router.get("/discord", passport.passport.authenticate('discord'));
        this.router.get("/discord/callback", passport.passport.authenticate('discord', { failureRedirect: "/" }), this.callback);
    }

    private async callback(req: Request, res: Response) {
        res.redirect("/");
    }

    private async logout(req: Request, res: Response) {
        req.logout(() => {})
        res.redirect("/");
    }
}