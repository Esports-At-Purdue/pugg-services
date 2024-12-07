import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import Game from "../../../shared/models/game.ts";

export default class SetAcsComponent extends ActionRowBuilder<StringSelectMenuBuilder> {
    public constructor(game: Game) {
        super();
        this.setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`player,${game.id},set-acs`)
                .setPlaceholder("Select a Player")
                .setMinValues(1)
                .setMaxValues(1)
                .setOptions(
                    game.players
                        .filter(player => player.stats.acs == 0)
                        .map(player => {
                            return new StringSelectMenuOptionBuilder()
                                .setValue(player.id)
                                .setLabel(player.username)
                                .setEmoji(player.getEmote())
                        })
                )
        )
    }
}