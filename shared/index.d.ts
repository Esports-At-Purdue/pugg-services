declare module "bun" {
    interface Env {
        BACKEND_PORT: number;
        BACKEND_HOST: string;
        DISCORD_PORT: number;
        AUTHORIZATION: string;
        CYPHER: string;
        PASSPORT_SECRET: string;
        MONGO_CONNECTION_STRING: string;
        BOILEREXAMS_AUTHORIZATION: string;
        DISCORD_API_URL: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_SECRET: string;
        DISCORD_CALLBACK_URL: string;
        GOOGLE_SHEETS_ID: string;
        EMAIL_USERNAME: string;
        EMAIL_PASSWORD: string;
    }
}

type CommandName = string;
type Id = string;
type QueueAction = "join" | "leave"

interface BotSettings {
    token:      string;
    serverId:   Id;
    status:     BotStatus;
    roles:      BotRoleSettings;
    channels:   BotChannelSettings;
    queues?:    BotQueueSetting[];
}

interface BotStatus {
    name:   string;
    type:   number;
}

interface BotChannelSettings {
    log:        string;
    join:       string;
    leave:      string;
    admin:      string;
    general:    string;
}

interface BotRoleSettings {
    member?:    string;
    purdue?:    string;
    admins:     string[];
}

interface TicketContent {
    authorId:   string;
    content:    string;
}

interface BotQueueSetting {
    name:       string;
    maxSize:    number;
    channelId:  Id;
}