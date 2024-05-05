import process from "process";
import Database from "../../shared/database.ts";
import {
    ActionRow,
    AuditLogEvent,
    ButtonComponent,
    Client,
    Events,
    Guild,
    GuildAuditLogsEntry,
    GuildMember,
    Interaction,
    Message,
    PartialGuildMember,
    PartialMessage,
    TextChannel,
} from "discord.js";
import JoinEmbed from "./embeds/join.embed.ts";
import Student from "../../shared/models/student.ts";
import LeaveEmbed from "./embeds/leave.embed.ts";
import BanEmbed from "./embeds/ban.embed.ts";
import Bot, {BotName} from "../../shared/models/bot.ts";
import DeleteComponent from "./components/delete.component.ts";
import Starboard from "../../shared/models/starboard.ts";
import handleRoleInteraction from "./utils/roles.ts";
import handleSheetsInteraction from "./utils/sheets.ts";
import {handleLfpModal, handleLftModal, handlePurdueModal, handleSheetsModal} from "./utils/modals.ts";
import Command from "./command.ts";
import express from "express";
import VerificationRouter from "./routes/verification.router.ts";
import HelpCommand from "./commands/help.ts";
import SayCommand from "./commands/say.ts";
import StatusCommand from "./commands/status.ts";
import LftCommand from "./commands/csgo/lft.ts";
import LfpCommand from "./commands/csgo/lfp.ts";
import LfpEditCommand from "./commands/csgo/lfp.edit.ts";
import LftEditCommand from "./commands/csgo/lft.edit.ts";
import Queue from "./queue.ts";
import {handleQueueAction} from "./utils/queue.ts";
import ErrorEmbed from "./embeds/error.embed.ts";
import DeletedEmbed from "./embeds/deleted.embed.ts";

interface Nameable {
    name: string
}

class Cache<T extends Nameable> {
    private map = new Map<string, T>;

    get all() {
        return Array.from(this.map.values());
    }

    public get(name: string) {
        const value = this.map.get(name);
        if (!value) throw new Error(`Unknown Value: ${name}`);
        return value;
    }

    public set(value: T) {
        this.map.set(value.name, value);
    }
}

function EventHandler(handler: Function, bot: Bot) {
    return (...args: any[]) => handler(bot, ...args);
}

const queues = new Cache<Queue>();
const commands = new Cache<Command>();
commands.set(new HelpCommand());
commands.set(new SayCommand());
commands.set(new StatusCommand());
commands.set(new LftCommand());
commands.set(new LfpCommand());
commands.set(new LftEditCommand());
commands.set(new LfpEditCommand());

Database.connect().then(async () => {
    Bot.fetchAll().then(async (bots) => {
        bots.forEach((bot) => {
            const client = new Client(bot.options);
            client.on(Events.ClientReady, EventHandler(ready, bot));
            client.on(Events.MessageCreate, EventHandler(messageCreate, bot));
            client.on(Events.MessageUpdate, EventHandler(messageUpdate, bot));
            client.on(Events.MessageDelete, EventHandler(messageDelete, bot));
            client.on(Events.InteractionCreate, EventHandler(interactionCreate, bot));
            client.on(Events.GuildMemberAdd, EventHandler(guildMemberAdd, bot));
            client.on(Events.GuildMemberRemove, EventHandler(guildMemberRemove, bot));
            client.on(Events.GuildAuditLogEntryCreate, EventHandler(guildAuditLogEntryCreate, bot));
            client.login(bot.settings.token).catch(console.log);
        });

        const app = express();
        app.use("/verify", new VerificationRouter().router);
        app.listen(Bun.env.DISCORD_PORT);
        console.log(`Listening on ${Bun.env.DISCORD_PORT}`);
    });
});

async function ready(bot: Bot, client: Client) {
    try {
        client.user?.setActivity(bot.settings.status);
        await bot.registerCommands(client, commands.all);
        const botQueues = await bot.loadQueues(client, bot.settings.queues);
        for (const queue of botQueues) queues.set(queue);
        console.log(bot.name + " is ready at " + client.readyAt?.toISOString());

        // Random Logic
    } catch (e: unknown) {
        const channel = await client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "Ready Error");
        await channel.send({ embeds: [ embed ] });
    }
}

async function messageCreate(bot: Bot, message: Message) {
    try {
        if (message.partial) return;

        if (message.channelId == "1143326543351910470") {
            if (!message.author.bot) {
                try {
                    setTimeout(() => {
                        message.delete();
                    }, 1000);
                } catch {  }
            }
        }

        if (!message.author.bot) {
            const content = message.content;

            if (content.includes("//twitter.com") || content.includes("//x.com")) {
                const newContent = content.replace("//twitter.com", "//fxtwitter.com").replace("//x.com", "//fxtwitter.com");
                setTimeout(() => { message.delete() }, 1000);
                await message.channel.send( {
                    content: `<@${message.author.id}> says:\n> ${newContent}`,
                    components: [ new DeleteComponent(message.author.id) ],
                    allowedMentions: { parse: [  ] }
                })
            }

            if (content.includes("//tiktok.com") || content.includes("www.tiktok.com")) {
                const newContent = content.replace("//tiktok.com", "//vxtiktok.com").replace("www.tiktok.com", "www.vxtiktok.com");
                setTimeout(() => { message.delete() }, 1000);
                await message.channel.send( {
                    content: `<@${message.author.id}> says:\n> ${newContent}`,
                    components: [ new DeleteComponent(message.author.id) ],
                    allowedMentions: { parse: [  ] }
                })
            }
        }

        if (bot.name == BotName.CSMemers) {
            if (message.author.id == "655390915325591629") {
                const votes = Starboard.parseNumberFromString(message.content);
                const embeds = message.embeds;

                if (embeds.length < 1) return;

                const messageUrlButton = message.components?.at(0)?.components?.at(0) as ButtonComponent | undefined;
                const messageUrl = messageUrlButton?.url;
                const urlParts = messageUrl?.split('/');
                const channelId = urlParts?.at(5);
                const messageId = urlParts?.at(6);

                if (messageId && channelId && votes) {
                    await new Starboard(messageId, channelId, votes).save();
                }
            }
        }
    } catch (e: unknown) {
        const channel = await message.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "MessageCreate Error");
        await channel.send({ embeds: [ embed ] });
    }
}

async function messageUpdate(bot: Bot, oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
    try {
        if (bot.name != BotName.CSMemers) {
            return;
        }

        await oldMessage.fetch();
        newMessage = await newMessage.fetch();

        if (newMessage.author.id != "655390915325591629") {
            return;
        }

        const buttonRow = newMessage.components[0] as ActionRow<ButtonComponent>;

        if (buttonRow) {
            const data = await Starboard.parseMessage(newMessage);

            if (!data) {
                return
            }

            const starboardMessage = await Starboard.fetch(data.id);
            if (starboardMessage) {
                starboardMessage.votes = Starboard.parseNumberFromString(newMessage.content);
                await starboardMessage.save();
            }
        } else {
            const data = await Starboard.parseOldMessage(newMessage);

            if (!data) {
                return
            }

            const starboardMessage = await Starboard.fetch(data.id);
            if (starboardMessage) {
                starboardMessage.votes = Starboard.parseNumberFromString(newMessage.content);
                await starboardMessage.save();
            }
        }

    } catch (e: unknown) {
        const channel = await newMessage.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "MessageUpdate Error");
        await channel.send({ embeds: [ embed ] });
    }

}

async function messageDelete(bot: Bot, message: Message) {
    if (bot.name != BotName.Valorant) {
        return;
    }

    if (message.author.bot) {
        return;
    }

    const channel = await message.client.channels.fetch(bot.settings.channels.deleted) as TextChannel;
    const embed = new DeletedEmbed(message.author, message.content, message.channelId);
    await channel.send({ embeds: [ embed ] });
}

async function interactionCreate(bot: Bot, interaction: Interaction) {
    const guild = interaction.guild;
    const channel = interaction.channel;

    if (!interaction.member) throw new Error("Missing Interaction Member");
    if (!channel) throw new Error("Missing Interaction Channel");
    if (!guild) throw new Error("Missing Interaction Guild");

    try {
        const member = await guild.members.fetch(interaction.member.user.id);
        const adminRoleIds = bot.settings.roles.admins;
        const isAdmin = member.roles.cache.some(role => adminRoleIds.some(roleId => role.id == roleId));

        if (interaction.isMessageComponent()) {
            const id = interaction.customId;
            const args = id.split(",");

            if (interaction.isButton()) {
                switch (args[0]) {
                    case "role": {
                        const roleId = args[1];
                        const role = await guild.roles.fetch(roleId);
                        await handleRoleInteraction(interaction, bot, member, role);
                    } break;

                    case "delete": {
                        const authorId = args[1];
                        const userId = interaction.user.id;

                        if (!isAdmin && authorId != userId) {
                            await interaction.reply({ content: "You don't have permission to do this.", ephemeral: true });
                            return;
                        }

                        await interaction.message.delete();

                    } break;

                    case "queue": {
                        const name = args[1];
                        const action = args[2] as QueueAction;
                        const queue = queues.get(name);
                        await handleQueueAction(queue, action, interaction);
                    } break;

                    default: { // Legacy Role Button Support
                        const roleId = args[0];
                        const role = await guild.roles.fetch(roleId);
                        await handleRoleInteraction(interaction, bot, member, role);
                    }
                }
            }

            if (interaction.isStringSelectMenu()) {
                switch (args[0]) {
                    case "role": {
                        const roleId = interaction.values[0];
                        const role = await guild.roles.fetch(roleId);
                        await handleRoleInteraction(interaction, bot, member, role);
                    } break;

                    case "sheets": {
                        const type = args[1];
                        const value = interaction.values[0];
                        await handleSheetsInteraction(interaction, type, value, args[2]);
                    } break;

                    default: { // Legacy Role Select Support
                        const roleId = interaction.values[0];
                        const role = await guild.roles.fetch(roleId);
                        await handleRoleInteraction(interaction, bot, member, role);
                    }
                }
            }

            if (interaction.isUserSelectMenu()) {
                switch (args[0]) {
                    default: {
                        await interaction.reply({ content: "This menu is not available", ephemeral: true });
                    }
                }
            }

            if (interaction.isRoleSelectMenu()) {
                switch (args[0]) {
                    default: {
                        await interaction.reply({ content: "This menu is not available", ephemeral: true });
                    }
                }
            }
        }

        if (interaction.isModalSubmit()) {
            const id = interaction.customId;
            const args = id.split(",");

            switch (args[0]) {
                case "purdue": {
                    const email = interaction.fields.getTextInputValue("email");
                    await handlePurdueModal(interaction, bot, member, email);
                } break;

                case "lft": { // BoilerCS Specific
                    await handleLftModal(interaction, member);
                } break;

                case "lfp": { // BoilerCS Specific
                    const teamName = args[1];
                    await handleLfpModal(interaction, member, teamName);
                } break;

                case "sheets": { // BoilerCS Specific
                    await handleSheetsModal(interaction, args);
                } break;

                default: {
                    await interaction.reply({ content: "This modal is not available", ephemeral: true });
                }
            }
        }

        if (interaction.isChatInputCommand()) {
            const name = interaction.commandName;
            const command = commands.get(name);

            if (command.restricted && !isAdmin) {
                await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                return;
            }

            await command.execute(interaction, bot);
        }
    } catch (e: unknown) {
        const channel = await interaction.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "Interaction Error");
        await channel.send({ embeds: [ embed ] });
    }
}

async function guildMemberAdd(bot: Bot, member: GuildMember) {
    try {
        const guild = await member.client.guilds.fetch(bot.settings.serverId);
        const channel = await guild.channels.fetch(bot.settings.channels.join) as TextChannel;
        await channel.send({  embeds: [ new JoinEmbed(member) ] });
        const student = await Student.fetch(member.id);
        if ((student && student.verified) || bot.name == BotName.CSMemers) {
            if (bot.settings.roles.member) await member.roles.add(bot.settings.roles.member).catch(() => {});
            if (bot.settings.roles.purdue) await member.roles.add(bot.settings.roles.purdue).catch(() => {});
        }
    } catch (e: unknown) {
        const channel = await member.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "GuildMemberAdd Error");
        await channel.send({ embeds: [ embed ] });
    }
}

async function guildMemberRemove(bot: Bot, member: GuildMember | PartialGuildMember) {
    try {
        const guild = await member.client.guilds.fetch(bot.settings.serverId);
        const channel = await guild.channels.fetch(bot.settings.channels.leave) as TextChannel;
        const embed = new LeaveEmbed(member);
        await channel.send({embeds: [ embed ] });
    } catch (e: unknown) {
        const channel = await member.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "GuildMemberRemove Error");
        await channel.send({ embeds: [ embed ] });
    }
}

async function guildAuditLogEntryCreate(bot: Bot, entry: GuildAuditLogsEntry, guild: Guild) {
    try {
        if (entry.action != AuditLogEvent.MemberBanAdd && entry.action != AuditLogEvent.MemberBanRemove) return;
        const channel = await guild.channels.fetch(bot.settings.channels.admin) as TextChannel;
        await channel.send({ embeds: [ new BanEmbed(entry as GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd | AuditLogEvent.MemberBanRemove>) ]} );
    } catch (e: unknown) {
        const channel = await guild.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "GuildAuditLogEntryCreate Error");
        await channel.send({ embeds: [ embed ] });
    }
}

console.log(`Discord: ${process.pid}`);