import {EmbedBuilder} from "discord.js";
import Player from "../../../shared/models/player.ts";

export default class LeaderboardEmbed extends EmbedBuilder {
    public constructor(players: Player[], page: number, skip: number) {
        super();
        this.setTitle(`Leaderboard Page ${page}`);
        this.setDescription(`${players
                .map(player => {
                    const emote = `<:test:${player.getEmote()}>`;
                    const index = players.indexOf(player);
                    const gameS = player.stats.games == 1 ? "game" : "games";
                    const elo = Math.round(player.stats.elo);
                    return `**#${skip + index + 1} ${emote} ${player.username}** - **${player.stats.games}** ${gameS} - **${elo}** elo`;
                })
                .join('\n')
            }`
        )
    }
}
