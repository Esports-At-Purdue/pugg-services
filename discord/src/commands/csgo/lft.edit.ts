import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import Command from "../../command.ts";
import {BotName} from "../../../../shared/models/bot.ts";
import {ephemeralReply} from "../../utils/interaction.ts";

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

    await ephemeralReply(interaction, { components: [ actionRow] });
}

export default class LftEditCommand extends Command {
    constructor() {
        super(true, builder, execute, BotName.CSGO);
    }
}