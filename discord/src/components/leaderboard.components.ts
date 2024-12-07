import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default class LeaderboardComponents extends ActionRowBuilder<ButtonBuilder> {
    public constructor(page: number, players: number) {
        super();
        const leftButtonDisabled = page == 1;
        const rightButtonDisabled = players != 10;
        this.setComponents(
            new ButtonBuilder()
                .setEmoji("1162429590954844340")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`leaderboard,left,${page}`)
                .setDisabled(leftButtonDisabled),
            new ButtonBuilder()
                .setEmoji("1162430047899099136")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`leaderboard,right,${page}`)
                .setDisabled(rightButtonDisabled),
            new ButtonBuilder()
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`leaderboard,refresh,${page}`)
        )
    }
}