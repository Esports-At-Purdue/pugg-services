import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const prompt = "What row do you want to delete?";

export default class SheetsRowModal extends ModalBuilder {
    public constructor(type: string) {
        super();
        const rowInput = new TextInputBuilder().setCustomId("row").setLabel(prompt).setStyle(TextInputStyle.Short);
        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(rowInput);
        this.addComponents(actionRow).setCustomId(`sheets-${type}-row`).setTitle("Remove a row");
    }
}