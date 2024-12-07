import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default class ShowModalComponent extends ActionRowBuilder<ButtonBuilder> {
    public constructor(name: string, ...args: string[]) {
        super();
        this.setComponents(
            new ButtonBuilder()
                .setCustomId(["modal", name, args].join(","))
                .setLabel("Show Modal")
                .setStyle(ButtonStyle.Primary)
        )
    }
}