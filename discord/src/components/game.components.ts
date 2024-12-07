import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import Game from "../../../shared/models/game.ts";

export default class GameComponents extends ActionRowBuilder<ButtonBuilder> {
    public constructor(game: Game) {
        super();
        const setTeamsDisabled = game.teams.at(0)?.players.length == 5 && game.teams.at(1)?.players.length == 5 || game.cancelled;
        const setAcsDisabled = !setTeamsDisabled || !game.players.some(player => player.stats.acs == 0) || game.cancelled;
        const setScoreDisabled = !setAcsDisabled || game.teams.at(0)?.isWinner || game.teams.at(1)?.isWinner || game.cancelled;
        const setCancelDisabled = game.cancelled;
        this.setComponents(
            new ButtonBuilder()
                .setLabel("Set Teams")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(["game", game.id, "set-teams"].join(','))
                .setDisabled(setTeamsDisabled),
            new ButtonBuilder()
                .setLabel("Set ACS")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(["game", game.id, "set-acs"].join(','))
                .setDisabled(setAcsDisabled),
            new ButtonBuilder()
                .setLabel("Set Score")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(["game", game.id, "set-score"].join(','))
                .setDisabled(setScoreDisabled),
            new ButtonBuilder()
                .setLabel("Cancel Game")
                .setStyle(ButtonStyle.Danger)
                .setCustomId(["game", game.id, "cancel"].join(','))
                .setDisabled(setCancelDisabled)
        )
    }
}