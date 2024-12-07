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
        DISCORD_SECRET: string;
        DISCORD_CALLBACK_URL: string;
        GOOGLE_SHEETS_ID: string;
        EMAIL_USERNAME: string;
        EMAIL_PASSWORD: string;
        FACEIT_URL: string;
        FACEIT_API_KEY: string;
        DISCORD_OAUTH_TOKEN_URL: string;
        DISCORD_API_URL: string;
        DISCORD_OAUTH_URL: string;
        DISCORD_OAUTH_URI: string
        DISCORD_CLIENT_ID: number
        DISCORD_CLIENT_SECRET: string;
        DISCORD_TOKEN: string;
    }
}

type CommandName = string;
type Id = string;
type QueueAction = "join" | "leave";
type GameAction = "set-teams" | "set-acs" | "set-score" | "cancel" | "cancel-confirm";
type TeamAction = "set-score";
type PlayerAction = "set-acs";
type LeaderboardAction = "left" | "right" | "refresh";

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
    deleted:    string;
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
    name:           string;
    maxSize:        number;
    channelId:      Id;
    modChannelId?:  Id;
}

interface FaceitPlayer {
    activated_at: string | Date;
    avatar: string;
    country: string;
    cover_featured_image: string;
    cover_image: string;
    faceit_url: string;
    friends_ids: string[];
    games: {
        cs2: {
            region: string,
            game_player_id: string,
            skill_level: number,
            faceit_elo: number,
            game_player_name: string,
            skill_level_label: string,
            regions: {},
            game_profile_id: string
        }
    },
    infractions: null,
    membership_type: string;
    memberships: string[];
    new_steam_id: string;
    nickname: string;
    platforms: object,
    player_id: string;
    settings: {
        language: string;
    },
    steam_id_64: string;
    steam_nickname: string;
    verified: boolean
}

interface OAuthResponse {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
    scope: string
}

interface UserResponse {
    id: string
    username: string
    discriminator: string
    global_name: string
    avatar: string
}

interface GuildData {
    id: string
    name: string
    icon: string
    banner: string
    permissions: string
}