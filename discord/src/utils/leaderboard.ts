import {ButtonInteraction, ChatInputCommandInteraction} from "discord.js";
import Database from "../../../shared/database.ts";
import LeaderboardEmbed from "../embeds/leaderboard.embed.ts";
import Player from "../../../shared/models/player.ts";
import LeaderboardComponents from "../components/leaderboard.components.ts";
import {ephemeralReply, noReply, reply} from "./interaction.ts";

export async function handleLeaderboardAction(interaction: ButtonInteraction | ChatInputCommandInteraction, action: LeaderboardAction, page: number) {

    switch (action) {
        case "left": {
            page -= 1;
            break;
        }

        case "right": {
            page += 1;
            break;
        }

        case "refresh": {
            break;
        }

        default: {
            await ephemeralReply(interaction, { content: "Unknown Leaderboard Action" });
            return;
        }
    }


    const itemsPerPage = 10;
    const skip = (page - 1) * itemsPerPage;
    const query = {
        "stats.games": {
            "$gt": 0
        }
    };

    try {
        // Fetch players sorted by elo in descending order
        const players = await Database.players.find(query).sort({ "stats.elo": -1 })
            .skip(skip)
            .limit(itemsPerPage)
            .toArray()

        if (players.length === 0) {
            await ephemeralReply(interaction, { content: "No players found for this page." });
            return;
        }

        const embed = new LeaderboardEmbed(players.map(player => new Player(player.id, player.username, player.stats)), page, skip);
        const components = new LeaderboardComponents(page, players.length);

        if (interaction.isChatInputCommand()) {
            await reply(interaction, { embeds: [ embed ], components: [ components ] });
        } else {
            await noReply(interaction);
            await interaction.message.edit({ embeds: [ embed ], components: [ components ] });
        }
    } catch (error) {
        await ephemeralReply(interaction, { content: "An error occurred while fetching the leaderboard." });
    }
}