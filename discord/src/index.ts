import process from "process";
import Database from "../../shared/database.ts";
import {
    AuditLogEvent,
    ButtonStyle,
    Client,
    Events,
    Guild,
    GuildAuditLogsEntry,
    GuildMember,
    Interaction,
    Message,
    ModalBuilder,
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
import TestCommand from "./commands/valorant/test.ts";
import Game from "../../shared/models/game.ts";
import {handleGameAction} from "./utils/game.ts";
import {handleTeamAction} from "./utils/team.ts";
import {handlePlayerAction} from "./utils/player.ts";
import TenmansCommand from "./commands/valorant/tenmans.ts";
import LeaderboardCommand from "./commands/valorant/leaderboard.ts";
import {handleLeaderboardAction} from "./utils/leaderboard.ts";
import FaceitCommand from "./commands/csgo/faceit.ts";
import {ephemeralReply} from "./utils/interaction.ts";
import SheetsRowModal from "./modals/sheets.row.modal.ts";
import QuestionModal from "./modals/question.modal.ts";
import PurdueModal from "./modals/purdue.modal.ts";
import SetAcsPlayerModal from "./components/set.acs.player.modal.ts";
import LftModal from "./modals/lft.modal.ts";
import LfpModal from "./modals/lfp.modal.ts";
import SetAcsComponent from "./components/set.acs.component.ts";

interface Nameable {
    name: string
}

interface Modal {
    name: string
    builder: ModalBuilder
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

export const queues = new Cache<Queue>();
export const modals = new Cache<Modal>();
const commands = new Cache<Command>();
commands.set(new HelpCommand());
commands.set(new SayCommand());
commands.set(new StatusCommand());
commands.set(new LftCommand());
commands.set(new LfpCommand());
commands.set(new LftEditCommand());
commands.set(new LfpEditCommand());
commands.set(new TestCommand());
commands.set(new TenmansCommand());
commands.set(new LeaderboardCommand());
commands.set(new FaceitCommand());

Database.connect().then(async () => {
    Bot.fetchAll().then(async (bots) => {
        bots.forEach((bot) => {
            const client = new Client(bot.options);
            client.on(Events.ClientReady, EventHandler(ready, bot));
            client.on(Events.MessageCreate, EventHandler(messageCreate, bot));
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

            if (content.includes("12-hours-after-my-shift-confused-nurse")) {
                setTimeout(() => { message.delete() }, 1000);
            }
        }

    } catch (e: unknown) {
        const channel = await message.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "MessageCreate Error");
        await channel.send({ embeds: [ embed ] });
    }
}

async function messageDelete(bot: Bot, message: Message | PartialMessage) {
    try {
        if (bot.name != BotName.Valorant) {
            return;
        }

        if (message.partial || message.author.bot) { // Typing is weird here, sometimes author/message is null
            return;
        }

        const channel = await message.client.channels.fetch(bot.settings.channels.deleted) as TextChannel;
        const embed = new DeletedEmbed(message.author, message.content, Array.from(message.attachments.values()), message.channelId);
        await channel.send({ embeds: [ embed ] });

    } catch (e: unknown) {
        const channel = await message.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "MessageDelete Error");
        await channel.send({ embeds: [ embed ] });
    }
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
                if (args[0] == "modal") {
                    switch (args[1]) {
                        case "purdue": {
                            await interaction.showModal(new PurdueModal());
                            break;
                        }

                        case "sheets": {
                            await interaction.showModal(new SheetsRowModal(args[2]));
                            break;
                        }

                        case "question": {
                            await interaction.showModal(new QuestionModal(args[2], args[3]));
                            break;
                        }

                        case "lft": {
                            await interaction.showModal(new LftModal(args.slice(2)))
                            break;
                        }

                        case "lfp": {
                            await interaction.showModal(new LfpModal(args[2], args.slice(3)));
                            break;
                        }

                        default: {
                            await ephemeralReply(interaction, { content: "Unknown modal: " + args[2]});
                            break;
                        }
                    }

                    return;
                }
            }

            if (interaction.isStringSelectMenu()) {
                if (args[0] == "player") {
                    const gameId = args[1];
                    const playerId = interaction.values[0];
                    const modal = new SetAcsPlayerModal(gameId, playerId);
                    await interaction.showModal(modal);
                    const game = await Game.fetch(Number.parseInt(gameId));
                    const component = new SetAcsComponent(game);
                    await interaction.message?.edit({ components: [ component ] });
                    return;
                }
            }

            await interaction.deferReply({ ephemeral: true });

            if (interaction.isButton()) {
                switch (args[0]) {
                    case "role": {
                        const roleId = args[1];
                        const role = await guild.roles.fetch(roleId);
                        await handleRoleInteraction(interaction, bot, member, role);
                        break;
                    }

                    case "delete": {
                        const authorId = args[1];
                        const userId = interaction.user.id;

                        if (!isAdmin && authorId != userId) {
                            await ephemeralReply(interaction, { content: "You don't have permission to do this." });
                            return;
                        }

                        await interaction.message.delete();
                        break;
                    }

                    case "queue": {
                        const name = args[1];
                        const action = args[2] as QueueAction;
                        const queue = queues.get(name);
                        await handleQueueAction(queue, action, interaction);
                        break;
                    }

                    case "game": {
                        const id = args[1];
                        const action = args[2] as GameAction;
                        const game = await Game.fetch(Number(id));
                        await handleGameAction(interaction, game, action);
                        break;
                    }

                    case "leaderboard": {
                        const action = args[1] as LeaderboardAction;
                        const page = Number.parseInt(args[2]);
                        await handleLeaderboardAction(interaction, action, page);
                        break;
                    }

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
                        break;
                    }

                    case "sheets": {
                        const type = args[1];
                        const value = interaction.values[0];
                        await handleSheetsInteraction(interaction, type, value, args[2]);
                        break;
                    }

                    case "game": {
                        const gameId = Number.parseInt(args[1]);
                        const action = args[2] as GameAction;
                        const game = await Game.fetch(gameId);
                        await handleGameAction(interaction, game, action);
                        break;
                    }

                    case "team": {
                        const gameId = Number.parseInt(args[1]);
                        const teamId = Number.parseInt(args[2]);
                        const action = args[3] as TeamAction;
                        const game = await Game.fetch(gameId);
                        await handleTeamAction(interaction, game, teamId, action);
                        break;
                    }

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
                        await ephemeralReply(interaction, { content: "This menu is not available" });
                    }
                }
            }

            if (interaction.isRoleSelectMenu()) {
                switch (args[0]) {
                    default: {
                        await ephemeralReply(interaction, { content: "This menu is not available" });
                    }
                }
            }
        }

        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ ephemeral: true });
            const id = interaction.customId;
            const args = id.split(",");

            switch (args[0]) {
                case "purdue": {
                    const email = interaction.fields.getTextInputValue("email");
                    await handlePurdueModal(interaction, bot, member, email);
                    break;
                }

                case "lft": { // BoilerCS Specific
                    await handleLftModal(interaction, member);
                    break;
                }

                case "lfp": { // BoilerCS Specific
                    const teamName = args[1];
                    await handleLfpModal(interaction, member, teamName);
                    break;
                }

                case "sheets": { // BoilerCS Specific
                    await handleSheetsModal(interaction, args);
                    break;
                }

                case "player": {
                    const gameId = Number.parseInt(args[1]);
                    const playerId = args[2];
                    const action = args[3] as PlayerAction;
                    const game = await Game.fetch(gameId);
                    await handlePlayerAction(interaction, game, playerId, action);
                    break;
                }

                default: {
                    await ephemeralReply(interaction, { content: "This modal is not available" });
                }
            }
        }

        if (interaction.isChatInputCommand()) {
            await interaction.deferReply({ ephemeral: true });
            const name = interaction.commandName;
            const command = commands.get(name);

            if (command.restricted && !isAdmin) {
                await ephemeralReply(interaction, { content: "You don't have permission to use this command." });
                return;
            }

            await command.execute(interaction, bot);
        }
    } catch (e: unknown) {
        const channel = await interaction.client.channels.fetch(bot.settings.channels.log) as TextChannel;
        const embed = new ErrorEmbed(e as Error, "Interaction Error");
        await channel.send({ embeds: [ embed ] });
        try {
            const error = e as Error;
            await ephemeralReply(interaction, { content: "Sorry, there was an error performing this operation. " + error.name });
        } catch {}
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