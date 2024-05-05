import {EmbedBuilder, User} from "discord.js";

export default class DeletedEmbed extends EmbedBuilder {
    public constructor(author: User, content: string, channelId: string) {
        super();
        this.setTitle(`${author.username} | ${author.id}`);
        this.setDescription(`**Channel**: <#${channelId}>\n\n**Content**: ${content}`);
    }
}