import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import Queue from "../queue.ts";

export default class QueueComponent extends ActionRowBuilder<ButtonBuilder> {
    public constructor(queue: Queue) {
        super();
        this.addComponents(
            new ButtonBuilder().setLabel("Join").setCustomId(["queue", queue.name, "join"].join(",")).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel("Leave").setCustomId(["queue", queue.name, "leave"].join(",")).setStyle(ButtonStyle.Danger),
        );
    }
}