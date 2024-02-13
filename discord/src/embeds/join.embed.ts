import {EmbedBuilder, GuildMember} from "discord.js";

export default class JoinEmbed extends EmbedBuilder {
    constructor(member: GuildMember) {
        super();
        this.setTitle(`${member.user.username} has joined`).setColor("#2f3136");
    }
}