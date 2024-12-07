import {Attachment, EmbedBuilder, User} from "discord.js";

export default class DeletedEmbed extends EmbedBuilder {
    public constructor(author: User, content: string, attachments: Attachment[], channelId: string) {
        super();
        this.setTitle(`${author.username} | ${author.id}`);
        this.setDescription(`**Channel**: <#${channelId}>\n\n**Content**: ${content}\n**Media**:\n` + attachments
            .map(attachment => {
                return attachment.proxyURL
            })
            .join('\n')
        );
    }
}