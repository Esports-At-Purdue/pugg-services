import {EmbedBuilder} from "discord.js";
import * as util from "node:util";

export default class ErrorEmbed extends EmbedBuilder {
    public constructor(error: Error, title: string) {
        super();
        this.setColor("#424549")
        this.setTitle(title);
        this.setDescription(util.inspect(error));
        this.setFooter({ text: "Error Log" });
    }
}