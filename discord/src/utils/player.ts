import {ModalSubmitInteraction, StringSelectMenuInteraction} from "discord.js";
import Game from "../../../shared/models/game.ts";
import GameEmbed from "../embeds/game.embed.ts";
import GameComponents from "../components/game.components.ts";
import SetAcsComponent from "../components/set.acs.component.ts";
import SetAcsPlayerModal from "../components/set.acs.player.modal.ts";
import {ephemeralReply, noReply} from "./interaction.ts";
import ShowModalComponent from "../components/show.modal.component.ts";

export async function handlePlayerAction(interaction: ModalSubmitInteraction, game: Game, playerId: string, action: PlayerAction) {
    switch (action) {
        case "set-acs": {
            const playerIndex = game.players.findIndex(player => player.id == playerId);
            const teamIndex = game.teams.findIndex(team => team.players.some(player => player.id == playerId));
            const playerIndexTeam = game.teams[teamIndex].players.findIndex(player => player.id == playerId);

            game.players[playerIndex].stats.acs = Number.parseInt(interaction.fields.getTextInputValue("acs"));
            game.teams[teamIndex].players[playerIndexTeam].stats.acs = Number.parseInt(interaction.fields.getTextInputValue("acs"));
            await game.save();

            if (game.players.some(player => player.stats.acs == 0)) {
                const embed = new GameEmbed(game);
                const component = new SetAcsComponent(game);
                await interaction.message?.edit({ embeds: [ embed ], components: [ component ] });
                await noReply(interaction);
                return;
            }

            const embed = new GameEmbed(game);
            const components = new GameComponents(game);
            await interaction.message?.edit({ embeds: [ embed ], components: [ components ] });
            await noReply(interaction);
        }
    }
}