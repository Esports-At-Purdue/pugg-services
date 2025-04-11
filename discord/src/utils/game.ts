import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ModalSubmitInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder, TextChannel
} from "discord.js";
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
import {queues} from "../index.ts";
import {places} from "googleapis/build/src/apis/places";

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

        case "edit": {
            const component = new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                        .setLabel("Edit ACS")
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(["game", game.id, "edit-acs"].join(',')),
                    new ButtonBuilder()
                        .setLabel("Edit Score")
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(["game", game.id, "edit-score"].join(',')),
                )
            await ephemeralReply(interaction, { content: "Please select an option.", components: [ component ] });
            break
        }

        case "edit-acs": {
            const component = new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`player,${game.id},edit-acs`)
                        .setPlaceholder("Select a Player")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            game.players
                                .map(player => {
                                    return new StringSelectMenuOptionBuilder()
                                        .setValue(player.id)
                                        .setLabel(`${player.username} - ${player.stats.acs} ACS`)
                                        .setEmoji(player.getEmote())
                                })
                        )
                )
            await ephemeralReply(interaction, { content: "Please select a player to edit.", components: [ component ] });
            break;
        }

        case "edit-score": {
            const component = new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`team,${game.id},edit-score`)
                        .setPlaceholder("Select a Team")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            new StringSelectMenuOptionBuilder()
                                .setValue("0")
                                .setLabel(`Team 1 - ${game.teams[0].score}`),
                            new StringSelectMenuOptionBuilder()
                                .setValue("1")
                                .setLabel(`Team 2 - ${game.teams[1].score}`),
                        )
                )
            await ephemeralReply(interaction, { content: "Please select a team to edit.", components: [ component ] });
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

export async function propagateGameChange(interaction: ModalSubmitInteraction | StringSelectMenuInteraction, game: Game) {
    await noReply(interaction);
    const games = await game.fetchAllAfter();
    games.unshift(game);

    const modifiedPlayers = new Map<string, Player>()
    for (const game of games) {
        game.players = []
        const teamOne = game.teams[0];
        const teamTwo = game.teams[1];

        if (teamOne.score > teamTwo.score) {
            game.teams[0].isWinner = true;
            game.teams[1].isWinner = false;
        }
        else if (teamTwo.score > teamOne.score) {
            game.teams[1].isWinner = true;
            game.teams[0].isWinner = false;
        }
        else {
            game.teams[0].isWinner = false;
            game.teams[1].isWinner = false;
        }

        const winningTeamIndex = teamOne.score > teamTwo.score ? 1 : teamTwo.score > teamTwo.score ? 2 : 0;

        for (const team of game.teams) {
            for (let i = 0; i < team.players.length; i++) {
                const teamPlayer = team.players[i];
                const modifiedPlayer = modifiedPlayers.get(teamPlayer.id);
                if (modifiedPlayer) {
                    team.players[i] = modifiedPlayer;
                }
            }
        }

        for (const team of game.teams) {
            let elo = 0;
            for (const player of team.players) {
                elo += player.stats.elo;
            }
            team.elo = elo / 5; // Update team elo
        }

        for (const team of game.teams) {
            const opponent = game.teams[1 - game.teams.indexOf(team)];
            for (const player of team.players) {
                const eloChange = Math.round(player.getEloChange(team.elo, opponent.elo, opponent.score, team.isWinner));
                if (team.isWinner) {
                    player.stats.elo += eloChange;
                    player.stats.wins += 1;
                } else {
                    player.stats.elo -= eloChange;
                    player.stats.losses += 1;
                }
                player.stats.games += 1;
                game.players.push(player);
                modifiedPlayers.set(player.id, player);
            }
        }

        await game.save();

        const embed = new GameEmbed(await Game.fetch(game.id), game.players);
        const components = new GameComponents(game);
        const channel = await interaction.client.channels.fetch(queues.get(game.queue).channelId) as TextChannel;


        if (interaction.channel != null) {
            if (winningTeamIndex == 0) {
                await interaction.channel.send({
                    content: `Game ${game.id} has been updated. No winner has been declared.`,
                    embeds: [embed],
                    components: [components]
                });
            } else {
                await interaction.channel.send({
                    content: `Game ${game.id} has been updated. Team ${winningTeamIndex} is the winner.`,
                    embeds: [embed],
                    components: [components]
                });
            }
        }
        if (winningTeamIndex == 0) {
            await channel.send({
                content: `Game ${game.id} has been updated. No winner has been declared.`,
                embeds: [ embed ]
            });
        } else {
            await channel.send({
                content: `Game ${game.id} has been updated. Team ${winningTeamIndex} is the winner.`,
                embeds: [ embed ]
            });
        }
    }
}