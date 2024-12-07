import {EmbedBuilder} from "discord.js";

export default class FaceitPlayerEmbed extends EmbedBuilder {
    public constructor(player: FaceitPlayer) {
        super();
        this.setThumbnail(player.avatar);
        this.setAuthor({
            iconURL: getThumbnail(player.games.cs2.skill_level),
            name:player.nickname,
            url: getProfile(player.nickname)
        });
        this.setFooter({
            iconURL: "https://play-lh.googleusercontent.com/4iFS-rI0ImIFZyTwjidPChDOTUGxZqX2sCBLRsf9g_noMIUnH9ywsCmCzSu9vSM9Jg",
            text: "faceit.com"
        });
        this.setDescription(
            `**Region:** ${player.games.cs2.region}\n` +
            `**Country:** ${player.country.toUpperCase()} ${getFlagEmoji(player.country)} \n` +
            `**Faceit Level:** ${player.games.cs2.skill_level}\n` +
            `**Faceit ELO:** ${player.games.cs2.faceit_elo}\n` +
            `**Steam Nickname:** ${player.steam_nickname}\n` +
            `**Memberships:** ${player.memberships.join(", ")}\n` +
            //`**Verified:** ${player.verified ? "Yes" : "No"}\n` +
            `**Activated At:** ${formatDate(player.activated_at)}`
        );
    }
}

function getProfile(nickname: string) {
    return `https://faceit.com/en/players/${nickname}`
}

function getThumbnail(level: number) {
    return `https://leetify.com/assets/images/rank-icons/faceit${level}.png`
}

function formatDate(date: string | Date) {
    if (typeof date === "string") {
        date = new Date(date);
    }
    return date.toLocaleDateString("en-US");
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}