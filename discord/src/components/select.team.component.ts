import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import Game from "../../../shared/models/game.ts";

export default class SelectTeamComponents extends ActionRowBuilder<StringSelectMenuBuilder> {
    public constructor(game: Game) {
        super();
        this.setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`game,${game.id},set-teams`)
                .setPlaceholder("Select Team 1 Players")
                .setMinValues(5)
                .setMaxValues(5)
                .setOptions(
                    game.players.map(player => {
                        return new StringSelectMenuOptionBuilder()
                            .setValue(player.id)
                            .setLabel(player.username)
                            .setEmoji(player.getEmote())
                    })
                )
        )
    }
}