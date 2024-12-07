import {ChatInputCommandInteraction, SlashCommandBuilder, Snowflake} from "discord.js";
import Command from "../command.ts";
import {ephemeralReply} from "../utils/interaction.ts";

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
        await ephemeralReply(interaction, { content: "Guild not found" });
        return;
    }

    const content = interaction.options.getString("content", true);
    const messageId = interaction.options.getString("id");

    if (messageId) { // Edit a preexisting message
        await interaction.channel?.messages.edit(messageId as Snowflake, { content: content, allowedMentions: { parse: [  ] } });
        await ephemeralReply(interaction, { content: "Success" });
        return;
    }

    await ephemeralReply(interaction, { content: "Success" });
    await interaction.channel?.send({ content: content, allowedMentions: { parse: [  ] } });
}

export default class SayCommand extends Command {
    constructor() {
        super(true, builder, execute);
    }
}