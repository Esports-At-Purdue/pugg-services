import {EmbedBuilder, GuildMember, PartialGuildMember} from "discord.js";

export default class LeaveEmbed extends EmbedBuilder {
    constructor(member: GuildMember | PartialGuildMember) {
        super();
        this.setTitle(`${member.user.username} has left`).setColor("#2f3136");
    }
}