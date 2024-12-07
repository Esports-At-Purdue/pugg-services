import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import Game from "../../../shared/models/game.ts";
import {NotFoundError} from "../../../shared/error.ts";

export default class SetAcsPlayerModal extends ModalBuilder {
    public constructor(gameId: string, playerId: string) {
        super();

        const component = new ActionRowBuilder<TextInputBuilder>().setComponents(
            new TextInputBuilder()
                .setCustomId("acs")
                .setLabel("Input an integer value for ACS")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
        );

        this.setCustomId(`player,${gameId},${playerId},set-acs`);
        this.setTitle(`Set ACS`);
        this.setComponents(component)
    }
}