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
    .setName('lft-edit')
    .setDescription('lft-edit command')

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
                .setCustomId("sheets-lft-options")
        );

    await interaction.reply({ components: [ actionRow], ephemeral: true });
}

export default class LftEditCommand extends Command {
    constructor() {
        super("lft-edit", false, true, builder, execute, BotName.CSGO);
    }
}