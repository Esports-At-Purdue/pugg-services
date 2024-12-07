import {ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {fetchSheetQuestions} from "../../utils/sheets.ts";
import LfpModal from "../../modals/lfp.modal.ts";
import Command from "../../command.ts";
import {BotName} from "../../../../shared/models/bot.ts";
import {ephemeralReply} from "../../utils/interaction.ts";
import {modals} from "../../index.ts";
import ShowModalComponent from "../../components/show.modal.component.ts";

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
        await ephemeralReply(interaction, { content: "Spreadsheet Data Not Found" });
        return;
    }

    const modal = new LfpModal(name, questions);
    modals.set({ name: name, builder: modal });

    const showModal = new ShowModalComponent("lfp", name, ...questions);
    await ephemeralReply(interaction, { content: "Click to show modal", components: [ showModal ] });
}

export default class LfpCommand extends Command {
    constructor() {
        super(false, builder, execute, BotName.CSGO);
    }
}