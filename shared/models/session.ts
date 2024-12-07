import Database from "../database.ts";
import {NotFoundError} from "../error.ts";
import axios from "axios";
import {APIUser} from "discord.js";
import NodeCache from "node-cache";

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;
const users = new NodeCache({ stdTTL: day, checkperiod: hour });

export default class Session {
    public readonly id:     string;
    public userId:          string;
    public token:           string;
    public refreshToken:    string;
    public expires:         Date;

    public constructor(id: string, userId: string, token: string, refreshToken: string, expires: Date) {
        this.id = id;
        this.userId = userId;
        this.token = token;
        this.refreshToken = refreshToken;
        this.expires = expires;
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        const result = await Database.sessions.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save session: ${this.id}`);
        return this;
    }

    public isExpired() {
        return Date.now() > this.expires.getDate()
    }

    public async getUser() {
        if (this.userId == "") {
            const userResponse = await axios.get(process.env.DISCORD_API_URL + "/users/@me", {
                headers: {
                    "User-Agent": "DiscordBot69420",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            })

            const user = userResponse.data as APIUser;
            this.userId = user.id;
            users.set(this.userId, user);
            return user;
        }

        if (users.has(this.userId)) {
            return users.get(this.userId) as APIUser;
        }

        if (this.isExpired()) {
            const response = await axios.post(process.env.DISCORD_OAUTH_TOKEN_URL,
                {
                    "client_id": process.env.DISCORD_CLIENT_ID,
                    "client_secret": process.env.DISCORD_CLIENT_SECRET,
                    "grant_type": "refresh_token",
                    "refresh_token": this.refreshToken
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )

            const oAuthData = response.data as OAuthResponse;
            this.token = oAuthData.access_token;
            this.refreshToken = oAuthData.token_type;
            this.expires = new Date(Date.now() + (oAuthData.expires_in * 1000));
            await this.save();
        }

        const userResponse = await axios.get(process.env.DISCORD_API_URL + "/users/@me", {
            headers: {
                "User-Agent": "DiscordBot69420",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })

        const user = userResponse.data as APIUser;
        users.set(this.userId, user);
        return user;
    }

    public static async fetch(id: Id) {
        const query = { id: id };
        const session = await Database.sessions.findOne(query);
        if (!session) throw new NotFoundError(`Session Not Found: ${id}`);
        return new Session(session.id, session.userId, session.token, session.refreshToken, session.expires);
    }
}