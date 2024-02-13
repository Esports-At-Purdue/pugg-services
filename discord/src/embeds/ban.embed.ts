import {AuditLogEvent, Colors, EmbedBuilder, GuildAuditLogsEntry} from "discord.js";

export default class BanEmbed extends EmbedBuilder {
    constructor(log: GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd | AuditLogEvent.MemberBanRemove>) {
        super();
        if (log.action == AuditLogEvent.MemberBanAdd) {
            return new EmbedBuilder()
                .setTitle(`${log.target?.username} was banned by the mighty ${log.executor?.username}`)
                .setDescription(`Reason: ${log.reason ?? "None Provided"}`)
                .setColor(Colors.Red)
        } else {
            return new EmbedBuilder()
                .setTitle(`${log.target?.username} was unbanned by the mighty ${log.executor?.username}`)
                .setColor(Colors.Green)
        }
    }
}