import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const prompt = "Input the new question (max 45 char)";

export default class QuestionModal extends ModalBuilder {
    public constructor(type: string, index: string) {
        super();
        const rowInput = new TextInputBuilder().setCustomId("q").setLabel(prompt).setStyle(TextInputStyle.Short);
        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(rowInput);
        this.addComponents(actionRow).setCustomId(`sheets-${type}-q-${index}`).setTitle("Change a question");
    }
}