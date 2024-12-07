import {ChatInputCommandInteraction, SlashCommandBuilder, Snowflake, TextChannel} from "discord.js";
import {BotName} from "../../../../shared/models/bot.ts";
import Command from "../../command.ts";
import Player from "../../../../shared/models/player.ts";
import {ephemeralReply} from "../../utils/interaction.ts";

const builder = new SlashCommandBuilder()
    .setName("tenmans")
    .setDescription("10-mans management")
    .addSubcommand((subcommand) => subcommand
        .setName("reset")
        .setDescription("reset everyone's elo")
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
        await ephemeralReply(interaction, { content: "Guild not found" });
        return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case "reset": {
            const players = await Player.fetchAll();

            for (const player of players) {
                player.stats.elo = 500;
                player.stats.games = 0;
                player.stats.wins = 0;
                player.stats.losses = 0;
                await player.save();
            }

            await ephemeralReply(interaction, { content: "Success" });

            break;
        }

        default: {
            await ephemeralReply(interaction, { content: `Unknown subcommand: ${subcommand}` });
        }
    }
}

export default class TenmansCommand extends Command {
    constructor() {
        super(true, builder, execute, BotName.Valorant);
    }
}