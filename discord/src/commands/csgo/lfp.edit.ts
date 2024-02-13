import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import Command from "../../command.ts";
import {BotName} from "../../../../shared/models/bot.ts";

const builder = new SlashCommandBuilder()
    .setName('lfp-edit')
    .setDescription('lfp-edit command')

async function execute(interaction: ChatInputCommandInteraction) {

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(
            new StringSelectMenuBuilder()
                .setOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Edit Question")
                        .setValue("edit"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Remove Row")
                        .setValue("row")
                )
                .setCustomId("sheets-lfp-options")
        );

    await interaction.reply({ components: [ actionRow], ephemeral: true });
    return;
}

export default class LfpEditCommand extends Command {
    constructor() {
        super("lfp-edit", false, true, builder, execute, BotName.CSGO);
    }
}