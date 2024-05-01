import {ColorResolvable, EmbedBuilder} from "discord.js";
import Queue from "../queue.ts";

export default class QueueEmbed extends EmbedBuilder {
    public constructor(queue: Queue, title: string, color?: ColorResolvable) {
        super();
        if (queue.users.length > 0) this.setDescription(queue.users.map((user, index) => `**${index + 1}.** ${user.username}`).join('\n'));
        if (queue.maxSize > 1) this.setTitle(`${queue.name}: ${title}`.concat(` [${queue.users.length}/${queue.maxSize}]`));
        else this.setTitle(`${queue.name}: ${title}`);
        this.setColor(color ?? "#424549");
    }
}