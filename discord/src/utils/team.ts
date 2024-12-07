import {StringSelectMenuInteraction, TextChannel} from "discord.js";
import Game from "../../../shared/models/game.ts";
import GameEmbed from "../embeds/game.embed.ts";
import GameComponents from "../components/game.components.ts";
import SetScoreComponent from "../components/set.score.component.ts";
import {queues} from "../index.ts";
import Player from "../../../shared/models/player.ts";
import {noReply} from "./interaction.ts";

export async function handleTeamAction(interaction: StringSelectMenuInteraction, game: Game, teamIndex: number, action: TeamAction) {
    switch (action) {
        case "set-score": {
            game.teams[teamIndex].score = Number.parseInt(interaction.values[0]);
            await game.save();

            if (game.teams[1 - teamIndex].score == -1) {
                const component = new SetScoreComponent(game);
                await interaction.message.edit({ components: [ component ] });
                await noReply(interaction);
                return;
            }
            // Run elo calculations!

            const teamOne = game.teams[0];
            const teamTwo = game.teams[1];

            if (teamOne.score > teamTwo.score) game.teams[0].isWinner = true;
            else game.teams[1].isWinner = true;

            await game.save();

            const winningTeamIndex = teamOne.score > teamTwo.score ? 1 : 2;

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
                    await player.save();
                }
            }

            const updatedPlayers = await Promise.all(game.players.map(async player => await Player.fetch(player.id)));
            const embed = new GameEmbed(await Game.fetch(game.id), updatedPlayers);
            const components = new GameComponents(game);
            const channel = await interaction.client.channels.fetch(queues.get(game.queue).channelId) as TextChannel;

            await noReply(interaction);
            await interaction.message.edit({ content: `Team ${winningTeamIndex} has won Game ${game.id}`, embeds: [ embed ], components: [ components ] });
            await channel.send({ content: `Team ${winningTeamIndex} has won Game ${game.id}`, embeds: [ embed ] });
        }
    }
}

/*
Winning: Rating + floor(25 * ACS/200 * (1 - (opponent elo - team elo)/(team elo)) * (1 + (opponent elo - player elo)/opponent elo)) * (1 + (10 - opponent rounds)/10))

Losing: Rating - floor(25 * 150/ACS * (1 - (opponent elo - team elo)/(team elo)) * (1  - (opponent elo - player elo)/opponent elo)) * (1 + (10 - opponent rounds)/10))

Everyone starts with 500 elo, teams are decided with ingame auto balancing
 */