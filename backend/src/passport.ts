import passport from "passport";
import DiscordStrategy from "passport-discord";
import Bot from "../../shared/models/bot.ts";
import {APIGuildMember} from "discord.js";

export default class Passport {
    public readonly passport: passport.PassportStatic;

    public constructor() {
        this.passport = passport;
        this.passport.use(new DiscordStrategy({
            clientID: Bun.env.DISCORD_CLIENT_ID,
            clientSecret: Bun.env.DISCORD_SECRET,
            callbackURL: Bun.env.DISCORD_CALLBACK_URL,
            scope: [ 'identify',  'guilds' ]
        }, async function(accessToken, refreshToken, profile, cb) {
            const id = profile.id;
            const bots = await Bot.fetchAll();

            for (const bot of bots) {
                try {
                    const response = await bot.axios.get(`/guilds/${bot.settings.serverId}/members/${id}`);
                    const member = response.data as APIGuildMember;
                    const roles = member.roles;
                    if (roles.some(role => bot.settings.roles.admins.some(adminRole => role == adminRole))) return true;
                } catch {  }
            }
            return false;
        }));

        // Serialize user to store in session
        this.passport.serializeUser((user, done) => {
            done(null, user);
        });

        // Deserialize user from session
        this.passport.deserializeUser((obj, done) => {
            // @ts-ignore
            done(null, obj);
        });
    }
}