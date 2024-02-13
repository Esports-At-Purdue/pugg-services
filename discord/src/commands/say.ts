import {ChatInputCommandInteraction, SlashCommandBuilder, Snowflake} from "discord.js";
import Command from "../command.ts";

const builder = new SlashCommandBuilder()
    .setName("say")
    .setDescription("say something with the bot!")
    .addStringOption((string) => string
        .setName("content")
        .setDescription("what to say")
        .setRequired(true)
        .setMaxLength(800)
    )
    .addStringOption((string) => string
        .setName("id")
        .setDescription("message to edit")
        .setRequired(false)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
        await interaction.reply({ content: "Guild not found", ephemeral: true });
        return;
    }

    const content = interaction.options.getString("content", true);
    const messageId = interaction.options.getString("id");

    if (messageId) { // Edit a preexisting message
        await interaction.channel?.messages.edit(messageId as Snowflake, { content: content, allowedMentions: { parse: [  ] } });
        await interaction.reply({ content: "Success", ephemeral: true });
        return;
    }

    await interaction.reply({ content: "Success", ephemeral: true });
    await interaction.channel?.send({ content: content, allowedMentions: { parse: [  ] } });
}

export default class SayCommand extends Command {
    constructor() {
        super("say", true, true, builder, execute);
    }
}