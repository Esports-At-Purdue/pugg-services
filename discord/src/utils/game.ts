import {ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, StringSelectMenuInteraction} from "discord.js";
import { z } from "zod";
import Game, {Team} from "../../../shared/models/game.ts";
import SelectTeamComponents from "../components/select.team.component.ts";
import Player from "../../../shared/models/player.ts";
import GameEmbed from "../embeds/game.embed.ts";
import GameComponents from "../components/game.components.ts";
import SetScoreComponent from "../components/set.score.component.ts";
import SetScoreTeamComponent from "../components/set.score.team.component.ts";
import SetAcsComponent from "../components/set.acs.component.ts";
import {noReply, ephemeralReply} from "./interaction.ts";

export async function handleGameAction(interaction: ButtonInteraction | StringSelectMenuInteraction, game: Game, action: GameAction) {
    switch (action) {
        case "set-teams": {
            if (interaction.isButton()) {
                const components = new SelectTeamComponents(game);
                await interaction.message.edit({ components: [ components ] });
                await noReply(interaction);
                return;
            }

            if (interaction.isStringSelectMenu()) {
                const playerIds = z.array(z.string()).parse(interaction.values);
                const players = await Promise.all(playerIds.map(async (playerId) => {
                    return await Player.fetch(playerId);
                }));
                const playersElo = players
                    .map(player => player.stats.elo)
                    .reduce((a, b) => a + b);

                game.teams.push(new Team(players, playersElo / players.length));

                const team = new Team();
                let elo = 0;
                for (const player of game.players) {
                    if (playerIds.includes(player.id)) continue;
                    team.players.push(player);
                    elo += player.stats.elo;
                }
                team.elo = elo / 5;

                game.teams.push(team);

                await game.save();

                const embed = new GameEmbed(game);
                const components = new GameComponents(game);

                await interaction.message.edit({ embeds: [ embed ], components: [ components ] });
                await noReply(interaction);
            }

            break;
        }

        case "set-acs": {
            if (interaction.isButton()) {
                const component = new SetAcsComponent(game);
                await interaction.message.edit({ components: [ component ] });
                await noReply(interaction);
                return;
            }
            break;
        }

        case "set-score": {
            if (interaction.isButton()) {
                const component = new SetScoreComponent(game);
                await interaction.message.edit({ components: [ component ] });
                await noReply(interaction);
                return;
            }

            if (interaction.isStringSelectMenu()) {
                const teamIndex = Number.parseInt(interaction.values[0]);
                const component = new SetScoreTeamComponent(game, teamIndex);
                await interaction.message.edit({ components: [ component ] });
                await noReply(interaction);
                return;
            }
        } break;

        case "cancel": {
            if (!interaction.isButton()) {
                await noReply(interaction);
                return;
            }

            const component = new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                        .setLabel("Confirm Cancellation")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(["game", game.id, "cancel-confirm"].join(','))
                )
            await ephemeralReply(interaction, { content: "Please confirm, or dismiss. This action is irreversible", components: [ component ] });
            break;
        }

        case "cancel-confirm": {
            game.cancelled = true;
            await game.save();
            await noReply(interaction);
            const embed = new GameEmbed(game);
            const component = new GameComponents(game);
            const message = await interaction.message.fetchReference();
            await message.edit({ embeds: [ embed ], components: [ component ] });
            break;
        }
    }
}