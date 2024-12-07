import {
    Interaction,
    InteractionEditReplyOptions,
    MessageCreateOptions
} from "discord.js";

export async function ephemeralReply(interaction: Interaction, options: InteractionEditReplyOptions) {
    if (interaction.isRepliable()) {
        await interaction.editReply(options);
    } else {
        throw new Error("Interaction is not repliable");
    }
}

export async function reply(interaction: Interaction, options: MessageCreateOptions) {
    if (interaction.isRepliable()) {
        await interaction.deleteReply();
        if (interaction.isChatInputCommand()) {
            const content = `</${interaction.commandName}:${interaction.commandId}>\n` + (options.content ?? "");
            await interaction.channel?.send({ ...options, content: content });
        } else {
            await interaction.channel?.send(options);
        }
    } else {
        throw new Error("Interaction is not repliable");
    }
}

export async function noReply(interaction: Interaction) {
    if (interaction.isRepliable()) {
        await interaction.deleteReply();
    } else {
        throw new Error("Interaction is not repliable");
    }
}