import {
    ButtonInteraction, ChatInputCommandInteraction,
    Client,
    ColorResolvable,
    Colors,
    MessageCollector,
    TextChannel,
    User
} from "discord.js";
import QueueEmbed from "./embeds/queue.embed.ts";
import QueueComponent from "./components/queue.component.ts";
import Player from "../../shared/models/player.ts";
import Game from "../../shared/models/game.ts";
import Database from "../../shared/database.ts";
import GameEmbed from "./embeds/game.embed.ts";
import GameComponents from "./components/game.components.ts";
import {ephemeralReply} from "./utils/interaction.ts";

export default class Queue extends Map<Id, [ User, Timer]> {
    public readonly name:           string;
    public readonly channelId:      Id;
    public readonly modChannelId?:  Id;
    public readonly maxSize:        number;
    public readonly timer:          number;
    public sendNewMessage?:          boolean;
    public lastMessage?:            Id;
    public collector?:              MessageCollector;

    constructor(name: string, channelId: Id, maxSize: number, timer: number, modChannelId?: string) {
        super();
        this.name = name;
        this.channelId = channelId;
        this.modChannelId = modChannelId;
        this.maxSize = maxSize;
        this.timer = timer;
    }

    public async load(client: Client) {
        const channel = await client.channels.fetch(this.channelId) as TextChannel;
        const messages = await channel.messages.fetch({ limit: 10 });

        for (const [ id, message ] of messages) {
            if (message.author.id == client.user?.id) {
                if (message.embeds.at(0)?.title?.toLowerCase().includes("[")) { // hacky way of finding queue embeds
                    this.lastMessage = id;
                    await this.createCollector(client, channel)
                    break;
                }
            }
        }

        await this.update(client, `The bot has been updated. A new queue has started`, Colors.White, false, new Date());
    }

    public get users() {
        const tuples = Array.from(this.values());
        return (tuples.map(tuple => tuple[0]));
    }

    public async join(user: User, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        if (this.has(user.id)) {
            await ephemeralReply(interaction, { content: "You're already in the queue!" });
            return;
        }

        try { // ToDo Doesn't seem to work rn
            await Player.fetch(user.id);
            const games = await Game.fetchAll();

            for (const game of games) {
                if (game.cancelled) continue;
                if (game.players.some(player => player.id == user.id)) {
                    if (game.teams?.at(0)?.isWinner || game.teams?.at(1)?.isWinner) continue;
                    console.log(game.id);
                    await ephemeralReply(interaction, { content: "You can't join the queue while in a game!" });
                    return;
                }
            }
        } catch {  }

        const timeout = global.setTimeout(async () => {
            const tuple = this.get(user.id);

            if (!tuple) {
                this.delete(user.id);
                return;
            }

            this.delete(user.id);
            await this.update(interaction.client, `${user.username} has been timed out`);
            await interaction.channel?.send({ content: `<@${user.id}> You have been timed out of the queue` }).then(message => {
                setTimeout(() => {
                    message.delete().catch(console.error);
                }, 15 * 60 * 1000);
            });

        }, this.timer);

        if (this.size == this.maxSize) {
            await ephemeralReply(interaction, { content: "Sorry, the queue is full!" });
            return;
        }

        this.set(user.id, [ user, timeout ]);

        if (this.size == this.maxSize) {
            await this.update(interaction.client, `${user.username} has joined - THE QUEUE HAS POPPED!`, Colors.Gold, true);
            for (const tuple of Array.from(this.values())) global.clearTimeout(tuple[1]);

            if (this.modChannelId) {
                const channel = await interaction.client.channels.fetch(this.modChannelId) as TextChannel;
                const players = await Promise.all(this.users.map(async (user) => {
                    try {
                        const player = await Player.fetch(user.id);
                        player.stats.acs = 0;
                        return player;
                    } catch {
                        return await new Player(user.id, user.displayName).save();
                    }
                }));

                const gameId = await Database.games.countDocuments();
                const game = await new Game(gameId, this.name, players).save();
                const embed = new GameEmbed(game);
                const components = new GameComponents(game);

                await channel.send({ content: `Game ${gameId} has started.`, embeds: [ embed ], components: [ components ] });
            }

            this.clear();
            await this.update(interaction.client, `A new queue has started`);
            return;
        }

        await this.update(interaction.client, `${user.username} has joined`, Colors.DarkGreen);

        if (interaction.isChatInputCommand()) return;
        await ephemeralReply(interaction, { content: "You have joined the queue" });
    }

    public async leave(user: User, interaction: ButtonInteraction) {
        const tuple = this.get(user.id);

        if (!tuple) {
            await ephemeralReply(interaction, { content: "You're not in the queue." });
            return;
        }

        const timeout = tuple[1];

        global.clearTimeout(timeout);
        this.delete(user.id);
        await this.update(interaction.client, `${user.username} has left`, Colors.DarkOrange);
        await ephemeralReply(interaction, { content: "You have left the queue" });
    }

    public async update(client: Client, title: string, color?: ColorResolvable, reset?: boolean, time?: Date) {
        const channel = await client.channels.fetch(this.channelId) as TextChannel;
        const embed = new QueueEmbed(this, title, color, time);
        const component = new QueueComponent(this);

        if (reset) {
            if (this.collector && !this.collector.ended) this.collector.stop("update");
            const content = this.users.map(user => `<@${user.id}>`).join('');
            await channel.send({ content: content, embeds: [ embed ] });
            this.sendNewMessage = true;
            return;
        }

        if (this.sendNewMessage || !this.lastMessage) {
            if (this.lastMessage) {
                const message = await channel.messages.fetch(this.lastMessage);
                await message.delete();
            }

            const message = await channel.send({ embeds: [ embed ], components: [ component ] });
            this.lastMessage = message.id;
            this.sendNewMessage = false;
            await this.createCollector(client, channel);
            return;
        }

        const message = await channel.messages.fetch(this.lastMessage);
        await message.edit({ embeds: [ embed ], components: [ component ] });
    }

    private async createCollector(client: Client, channel: TextChannel) {
        const lastMessage = this.lastMessage
        if (!lastMessage) throw new Error("Unreachable Missing LastMessage Queue");

        const time = new Date();
        this.collector = new MessageCollector(channel, { max: 10 })
            .on("end",  async(_, reason) => {
                if (reason == "update") return;
                this.sendNewMessage = true;
                const message = await channel.messages.fetch(lastMessage);
                const title = message.embeds[0].title;
                const color = message.embeds[0].color;
                await this.update(client, title?.split("[")?.at(0)?.slice(this.name.length + 2) ?? "Unknown Title - Unsure how to proceed..", color ?? Colors.Purple, false, time);
            });

    }
}

