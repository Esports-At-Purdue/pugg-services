import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {fetchSheetQuestions} from "../../utils/sheets.ts";
import LfpModal from "../../modals/lfp.modal.ts";
import Command from "../../command.ts";
import {BotName} from "../../../../shared/models/bot.ts";

const builder = new SlashCommandBuilder()
    .setName('lfp')
    .setDescription('looking-for-players command')
    .addStringOption((string) => string
        .setName("name")
        .setDescription("the name of your team")
        .setRequired(true)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString("name") as string;
    const questions = await fetchSheetQuestions("lfp");

    if (!questions) {
        await interaction.reply({ content: "Spreadsheet Data Not Found", ephemeral: true });
        return;
    }

    const modal = new LfpModal(name, questions);
    await interaction.showModal(modal);
}

export default class LfpCommand extends Command {
    constructor() {
        super("lfp", false, false, builder, execute, BotName.CSGO);
    }
}