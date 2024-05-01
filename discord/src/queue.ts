import {
    ButtonInteraction,
    Client,
    ColorResolvable,
    Colors,
    Message,
    MessageCollector,
    TextChannel,
    User
} from "discord.js";
import QueueEmbed from "./embeds/queue.embed.ts";
import QueueComponent from "./components/queue.component.ts";

export default class Queue extends Map<Id, [ User, NodeJS.Timeout]> {
    public readonly name:           string;
    public readonly channelId:      Id;
    public readonly maxSize:        number;
    public readonly timer:          number;
    public sendNewMessage:          boolean;
    public lastMessage?:            Id;

    constructor(name: string, channelId: Id, maxSize: number, timer: number) {
        super();
        this.name = name;
        this.channelId = channelId;
        this.maxSize = maxSize;
        this.timer = timer;
        this.sendNewMessage = true;
    }

    public async load(client: Client) {
        const channel = await client.channels.fetch(this.channelId) as TextChannel;
        const messages = await channel.messages.fetch({ limit: 10 });

        for (const [ _id, message ] of messages) {
            //if (message.author.id == client.user?.id) await message.delete();
        }

        //await this.update(client, `The queue has loaded!`);
    }

    public get users() {
        const tuples = Array.from(this.values());
        return (tuples.map(tuple => tuple[0]));
    }

    public async join(user: User, interaction: ButtonInteraction) {
        if (this.has(user.id)) {
            await interaction.reply({ content: "You're already in the queue!", ephemeral: true });
            return;
        }

        const timeout = global.setTimeout(async () => {
            const tuple = this.get(user.id);

            if (!tuple) {
                this.delete(user.id);
                return;
            }

            this.delete(user.id);
            await this.update(interaction.client, `${user.username} has been timed out`);
            await interaction.followUp({ content: "You have been timed out of the queue", ephemeral: true });

        }, this.timer);

        if (this.size == this.maxSize) {
            await interaction.reply({ content: "Sorry, the queue is full!", ephemeral: true });
            return;
        }

        this.set(user.id, [ user, timeout ]);

        if (this.size == this.maxSize) {
            await this.update(interaction.client, `${user.username} has joined - THE QUEUE HAS POPPED!`, Colors.Gold, true);
            for (const tuple of Array.from(this.values())) global.clearTimeout(tuple[1]);
            this.clear();
            await this.update(interaction.client, `A new queue has started`);
            return;
        }

        await this.update(interaction.client, `${user.username} has joined`, Colors.DarkGreen);
        await interaction.reply({ content: "You have joined the queue", ephemeral: true });
    }

    public async leave(user: User, interaction: ButtonInteraction) {
        const tuple = this.get(user.id);

        if (!tuple) {
            await interaction.reply({ content: "You're not in the queue.", ephemeral: true });
            return;
        }

        const timeout = tuple[1];

        global.clearTimeout(timeout);
        this.delete(user.id);
        await this.update(interaction.client, `${user.username} has left`, Colors.DarkOrange);
        await interaction.reply({ content: "You have left the queue", ephemeral: true });
    }

    public async update(client: Client, title: string, color?: ColorResolvable, reset?: boolean) {
        const channel = await client.channels.fetch(this.channelId) as TextChannel;
        const embed = new QueueEmbed(this, title, color);
        const component = new QueueComponent(this);

        if (reset) {
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

            new MessageCollector(channel, { max: 10, filter: filter })
                .on("end",  async() => {
                    this.sendNewMessage = true;
                    await this.update(client, title, color);
                });

            return;
        }

        const message = await channel.messages.fetch(this.lastMessage);
        await message.edit({ embeds: [ embed ], components: [ component ] });
    }
}

function filter(message: Message) {
    return !message.author.bot;
}