import { EmbedBuilder } from "discord.js";
import Game from "../../../shared/models/game.ts";
import Player from "../../../shared/models/player.ts";

export default class GameEmbed extends EmbedBuilder {
    public constructor(game: Game, updatedPlayers?: Player[]) {
        super();
        if (game.cancelled) {
            this.setTitle(`Game ${game.id} - CANCELLED`);
        } else {
            this.setTitle(`Game ${game.id}`);
        }

        const getEloChange = (player: Player) => {
            if (!updatedPlayers) return null;
            const updatedPlayer = updatedPlayers.find(p => p.id === player.id);
            if (!updatedPlayer) return null;
            return updatedPlayer.stats.elo - player.stats.elo;
        };

        const formatPlayer = (player: Player) => {
            const acs = game.players.find(p => p.id === player.id)?.stats.acs;
            const elo = player.stats.elo;
            const eloChange = getEloChange(player);
            const eloChangeString = eloChange != null ? ` (${eloChange > 0 ? '+' : ''}${eloChange})` : '';
            player.stats.elo = eloChange ? elo + eloChange : elo;
            const emote = `<:test:${player.getEmote()}>`;
            return `${emote}: **${player.username}** - ${player.stats.elo} elo${eloChangeString}${acs ? ` - ${acs} acs` : ''}`;
        };

        if (game.teams.length === 2) {
            const team1 = game.teams[0];
            const team2 = game.teams[1];

            const team1Players = team1.players.map(formatPlayer).join('\n');
            const team2Players = team2.players.map(formatPlayer).join('\n');

            this.setDescription(`Team 1: **${team1.score}**\n${team1Players}\n\nTeam 2: **${team2.score}**\n${team2Players}`);
        } else {
            const allPlayers = game.players.map(formatPlayer).join('\n');
            this.setDescription(allPlayers);
        }
    }
}
