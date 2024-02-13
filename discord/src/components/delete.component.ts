import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default class DeleteComponent extends ActionRowBuilder<ButtonBuilder> {
    constructor(id: string) {
        super();
        this.setComponents(
            new ButtonBuilder()
                .setCustomId(["delete", id].join(","))
                .setLabel("Delete")
                .setStyle(ButtonStyle.Secondary)
        )
    }
}