import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {BotName} from "../../../../shared/models/bot.ts";
import Command from "../../command.ts";
import {handleLeaderboardAction} from "../../utils/leaderboard.ts";
import {ephemeralReply} from "../../utils/interaction.ts";

const builder = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("10-mans leaderboard")
    .addIntegerOption((integer) => integer
        .setName("page")
        .setDescription("which page to use")
        .setMinValue(1)
        .setRequired(false)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
        await ephemeralReply(interaction, { content: "Guild not found" });
        return;
    }

    const page = interaction.options.getInteger("page") ?? 1;
    await handleLeaderboardAction(interaction, "refresh", page);
}

export default class LeaderboardCommand extends Command {
    constructor() {
        super(false, builder, execute, BotName.Valorant);
    }
}