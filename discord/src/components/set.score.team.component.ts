import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import Game from "../../../shared/models/game.ts";

export default class SetScoreTeamComponent extends ActionRowBuilder<StringSelectMenuBuilder> {
    public constructor(game: Game, teamIndex: number) {
        super();

        const options: StringSelectMenuOptionBuilder[] = [];
        for (let i = 1; i <= 25; i++) {
            options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(i.toString())
                    .setValue(i.toString())
            );
        }

        this.setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(["team", game.id, teamIndex, "set-score"].join(','))
                .setPlaceholder("Select a Score")
                .setMaxValues(1)
                .setOptions(...options)
        );
    }
}
