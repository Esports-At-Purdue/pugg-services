import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {fetchSheetQuestions} from "../../utils/sheets.ts";
import LftModal from "../../modals/lft.modal.ts";
import Command from "../../command.ts";
import {BotName} from "../../../../shared/models/bot.ts";
import ShowModalComponent from "../../components/show.modal.component.ts";
import {ephemeralReply} from "../../utils/interaction.ts";

const builder = new SlashCommandBuilder()
    .setName('lft')
    .setDescription('looking-for-team command')

async function execute(interaction: ChatInputCommandInteraction) {
    const questions = await fetchSheetQuestions("lft");

    if (!questions) {
        await ephemeralReply(interaction, { content: "Spreadsheet Data Not Found" });
        return;
    }

    const showModal = new ShowModalComponent("lft", ...questions);
    await ephemeralReply(interaction, { components: [ showModal ] });
}

export default class LftCommand extends Command {
    constructor() {
        super(false, builder, execute, BotName.CSGO);
    }
}