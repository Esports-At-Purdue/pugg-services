import Database from "../database.ts";
import {NotFoundError} from "../error.ts";
import Axios from "axios";
import {Client, GatewayIntentBits, MessageMentionTypes, Partials,} from "discord.js";
import Command from "../../discord/src/command.ts";
import Queue from "../../discord/src/queue.ts";

export default class Bot {
    public readonly id:         Id;
    public readonly name:       BotName;
    public readonly settings:   BotSettings;

    public constructor(id: Id, name: BotName, settings: BotSettings) {
        this.id = id;
        this.name = name;
        this.settings = settings;
    }

    public get axios() {
        return Axios.create({
            baseURL: Bun.env.DISCORD_API_URL,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${this.settings.token}`
            }
        })
    }

    public get options() {
        return {
            intents: [
                GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.Message
            ],
            allowedMentions: {
                parse: [ "users" ] as MessageMentionTypes[]
            }
        };
    }

    public async registerCommands(client: Client, commands: Command[]) {
        console.log(`Registering Commands for: ${client.user?.username}`)
        const guild = await client.guilds.fetch(this.settings.serverId);
        const guildCommands = commands.filter(command => command.botName == this.name);
        const globalCommands = commands.filter(command => command.global);
        await guild.commands.set(guildCommands.map(command => command.builder.toJSON()));
        await client.application?.commands.set(globalCommands.map(command => command.builder.toJSON()));
    }

    public async loadQueues(client: Client, queueSettings?: BotQueueSetting[]) {
        if (!queueSettings || client.user?.username != "R6 Purdue") return [  ];
        console.log(`Loading Queues for: ${client.user?.username}`);
        return await Promise.all(queueSettings.map(async (queueSetting) => {
            const queue = new Queue(queueSetting.name, queueSetting.channelId, queueSetting.maxSize, 60 * 60 * 1000);
            await queue.load(client);
            return queue;
        }));
    }

    public async save() {
        const query = { id: this.id };
        const update = { $set: this };
        const options = { upsert: true };
        const result = await Database.bots.updateOne(query, update, options);
        if (!result.acknowledged) throw new Error(`Unable to save bot: ${this.id}`);
        return this;
    }

    public static async fetch(id: Id) {
        const query = { id: id };
        const bot = await Database.bots.findOne(query);
        if (!bot) throw new NotFoundError(`Bot Not Found: ${id}`);
        return new Bot(bot.id, bot.name, bot.settings);
    }

    public static async fetchAll() {
        const bots = await Database.bots.find().toArray();
        return bots.map(bot => new Bot(bot.id, bot.name, bot.settings));
    }
}

export enum BotName {
    CSGO = "csgo",
    CSMemers = "csmemers",
    Fortnite = "fortnite",
    Math = "math",
    Overwatch = "overwatch",
    Pugg = "pugg",
    Siege = "siege",
    Valorant = "valorant"
}