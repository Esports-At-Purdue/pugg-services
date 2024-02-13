import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {fetchSheetQuestions} from "../../utils/sheets.ts";
import LftModal from "../../modals/lft.modal.ts";
import Command from "../../command.ts";
import {BotName} from "../../../../shared/models/bot.ts";

const builder = new SlashCommandBuilder()
    .setName('lft')
    .setDescription('looking-for-team command')

async function execute(interaction: ChatInputCommandInteraction) {
    const questions = await fetchSheetQuestions("lft");

    if (!questions) {
        await interaction.reply({ content: "Spreadsheet Data Not Found", ephemeral: true });
        return;
    }

    const modal = new LftModal(questions);
    await interaction.showModal(modal);
}

export default class LftCommand extends Command {
    constructor() {
        super("lft", false, false, builder, execute, BotName.CSGO);
    }
}