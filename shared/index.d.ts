declare module "bun" {
    interface Env {
        BACKEND_PORT: number;
        AUTHORIZATION: string;
        MONGO_CONNECTION_STRING: string;
        BOILEREXAMS_AUTHORIZATION: string;
        DISCORD_CLIENT_ID: string,
        DISCORD_SECRET: string
        DISCORD_CALLBACK_URL: string,
    }
}

interface BotSettings {
    token: string;
    serverId: string;
    roles: BotRoleSettings;
    channels: BotChannelSettings;
}

interface BotRoleSettings {
    log: string;
    join: string;
    leave: string;
    admin: string;
    general: string;
}

interface BotRoleSettings {
    member?: string;
    purdue?: string;
    admins: string[];
}

interface TicketContent {
    authorId: string;
    content: string;
}