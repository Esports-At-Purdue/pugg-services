import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import Game from "../../../shared/models/game.ts";

export default class SetScoreComponent extends ActionRowBuilder<StringSelectMenuBuilder> {
    public constructor(game: Game) {
        super();
        this.setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`game,${game.id},set-score`)
                .setPlaceholder("Select a Team")
                .setMinValues(1)
                .setMaxValues(1)
                .setOptions(
                    game.teams
                        .filter(team => team.score == -1)
                        .map(team => {
                            return new StringSelectMenuOptionBuilder()
                                .setValue(game.teams.indexOf(team).toString())
                                .setLabel(`Team ${game.teams.indexOf(team) + 1}`)
                        })
                )
        )
    }
}