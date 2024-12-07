import {ChatInputCommandInteraction, SlashCommandBuilder, Snowflake, TextChannel} from "discord.js";
import {BotName} from "../../../../shared/models/bot.ts";
import Command from "../../command.ts";
import Player from "../../../../shared/models/player.ts";
import Database from "../../../../shared/database.ts";
import Game from "../../../../shared/models/game.ts";
import GameEmbed from "../../embeds/game.embed.ts";
import GameComponents from "../../components/game.components.ts";
import {queues} from "../../index.ts";
import {ephemeralReply} from "../../utils/interaction.ts";

const builder = new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test 10-mans!")
    .addIntegerOption((integer) => integer
        .setName("number")
        .setDescription("test number")
        .setMinValue(1)
        .setMaxValue(5)
        .setRequired(true)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
        await ephemeralReply(interaction, { content: "Guild not found" });
        return;
    }

    const testNumber = interaction.options.getInteger("number", true);

    switch (testNumber) {
        case 1: {
            const queue = queues.get("Val 10mans Queue");

            if (!queue.modChannelId) {
                return;
            }

            const userIds = [
                "721170371826679841",
                "204537858269118466",
                "258440905327902720",
                "208679284519337984",
                "398853655681433601",
                "457929277015326740",
                "408612451546955787",
                "751910711218667562",
                "312770439631994880",
                "193850796918571019"
            ];

            const users = [];

            for (let i = 0; i < 10; i++) {
                const user = await interaction.client.users.fetch(userIds[i]);
                users.push(user);
            }

            const channel = await interaction.client.channels.fetch(queue.modChannelId) as TextChannel;
            const players = await Promise.all(users.map(async (user) => {
                try {
                    const player = await Player.fetch(user.id);
                    player.stats.acs = 0;
                    return player;
                } catch {
                    return await new Player(user.id, user.displayName).save();
                }
            }));

            const gameId = await Database.games.countDocuments();
            const game = await new Game(gameId, queue.name, players).save();
            const embed = new GameEmbed(game);
            const components = new GameComponents(game);

            await channel.send({ content: `Game ${gameId} has started.`, embeds: [ embed ], components: [ components ] });

            await ephemeralReply(interaction, { content: "Success " });
            break;
        }

        case 2: {
            const queue = queues.get("Val 10mans Queue");

            if (!queue.modChannelId) {
                return;
            }

            const userIds = [
                "721170371826679841",
                "204537858269118466",
                "258440905327902720",
                "208679284519337984",
                "398853655681433601",
                "457929277015326740",
                "408612451546955787",
                //"751910711218667562",
                "312770439631994880",
                "193850796918571019"
            ];

            const users = [];

            for (let i = 0; i < 9; i++) {
                const user = await interaction.client.users.fetch(userIds[i]);
                users.push(user);
            }

            for (const user of users) {
                await queue.join(user, interaction);
            }

            await ephemeralReply(interaction, { content: "Success " });
            break;
        }

        case 3: {
            await ephemeralReply(interaction, { content: "Test" });
            break;
        }

        default: {
            await ephemeralReply(interaction, { content: "This test number doesn't exist" });
            break;
        }
    }
}

export default class TestCommand extends Command {
    constructor() {
        super(true, builder, execute, BotName.Valorant);
    }
}