import express, {Request, Response} from "express";
import NodeCache from "node-cache";
import crypto from "crypto";
import axios, {AxiosError} from "axios";
import Session from "../../../shared/models/session.ts";
import {APIUser} from "discord.js";

const minute = 60;
const nonces = new NodeCache({ stdTTL: 5 * minute, checkperiod: minute });

export default class AuthRouter {
    public readonly router: express.Router;

    public constructor() {
        this.router = express.Router();
        this.router.get("/me", this.me);
        this.router.get("/discord", this.auth);
        this.router.get("/discord/login", this.login);
    }

    private async me(req: Request, res: Response) {
        const sessionId = req.cookies.sessionId;

        try {
            const session = await Session.fetch(sessionId);
            const user = await session.getUser();
            res.status(200).send(user);
        } catch (e) {
            console.log("Session not found error", e);
            res.sendStatus(404);
        }
    }

    private async login(req: Request, res: Response) {
        const sessionId = req.cookies.sessionId;

        try {
            await Session.fetch(sessionId);
            res.redirect(createRedirect(req, getHost(req)))
            return;
        } catch {}

        const redirectUri = createUri(req, process.env.DISCORD_OAUTH_URI);
        const redirectUrl = process.env.DISCORD_OAUTH_URL;
        const clientId = process.env.DISCORD_CLIENT_ID;
        const responseType = "code";
        const scope = "identify email guilds";
        const prompt = "none";
        const ip = getIpAddress(req);

        if (ip instanceof Error) {
            res.status(400).send({"message": "unable to determine origin ip address"});
            return;
        }

        const state = createNonce(ip);
        const params = `?response_type=${responseType}&client_id=${clientId}&scope=${scope}&prompt=${prompt}&redirect_uri=${redirectUri}&state=${state}`
        res.redirect(307, redirectUrl + params);
    }

    private async auth(req: Request, res: Response) {
        const { state, code } = req.query;
        const ip = getIpAddress(req);

        if (ip instanceof Error) {
            res.status(400).send({"message": "unable to determine origin ip address"});
            return;
        }

        const validated = validateNonce(ip, state);

        if (validated instanceof Error || !validated) {
            res.status(400).send({"message": "invalid state"});
            return;
        }

        if (!code) {
            res.status(400).send({"message": "invalid code"});
            return;
        }

        const tokenUrl = process.env.DISCORD_OAUTH_TOKEN_URL;

        try {
            const response = await axios.post(tokenUrl,
                {
                    "client_id": process.env.DISCORD_CLIENT_ID,
                    "client_secret": process.env.DISCORD_CLIENT_SECRET,
                    "redirect_uri": createUri(req, process.env.DISCORD_OAUTH_URI),
                    "grant_type": "authorization_code",
                    "code": code
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )

            const oAuthData = response.data as OAuthResponse;
            const host = getHost(req);
            const expireDate = Date.now() + (oAuthData.expires_in * 1000);

            try {
                const userResponse = await axios.get(process.env.DISCORD_API_URL + "/users/@me", {
                    headers: {
                        "Authorization": `Bearer ${oAuthData.access_token}`
                    }
                });
                const userData = userResponse.data as APIUser;

                const session = await new Session(getHash(userData.id + Date.now()), userData.id, oAuthData.access_token, oAuthData.refresh_token, new Date(expireDate)).save();
                res.cookie("sessionId", session.id, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                }).redirect(createRedirect(req, host));
                return;
            } catch (e) {
                console.log("Fetch discord user error", e);
                res.sendStatus(500);
            }

        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                console.log("Axios error on discord OAuth", e);
                res.status(400).send(e);
                return;
            } else {
                res.status(500).send("Unknown Error: " + typeof Error);
                return;
            }
        }
    }
}

function createRedirect(req: Request, host: string) {
    return "http://" + "localhost:5173"
    /*
    if (req.header("X-Protocol") == "https") {
        return "https://" + host;
    } else {
        return "http://" + host;
    }

     */
}

function createUri(req: Request, uri: string) {
    if (req.header("X-Protocol") == "https") {
        return "https://" + req.hostname + uri;
    } else {
        return "http://" + req.hostname + uri;
    }
}

function getHost(req: Request) {
    const host = req.header("Host");
    return host ?? req.hostname ?? new Error("Unknown Host");
}

function getIpAddress(req: Request): string | Error {
    const ip = req.header("X-Real-IP");
    return ip ?? req.ip ?? new Error("Unknown IP");
}

function createNonce(ip: string) {
    const nonce = getHash(ip + new Date());
    nonces.set(ip, nonce);
    return nonce;
}

function validateNonce(ip: string, nonce: unknown): boolean | Error {
    if (!nonces.has(ip)) {
        return new Error()
    }

    const value = nonces.get(ip);

    if (value != nonce) {
        return new Error()
    }

    return true;
}

function getHash(value: string) {
    return crypto.createHash("sha256").update(value).digest("hex");
}