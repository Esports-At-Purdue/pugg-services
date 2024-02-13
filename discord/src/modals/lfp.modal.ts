import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class LfpModal extends ModalBuilder {
    public constructor(name: string, questions: string[]) {
        super();
        const inputA = new TextInputBuilder().setCustomId("experience").setLabel(questions[0]).setStyle(TextInputStyle.Paragraph);
        const inputB = new TextInputBuilder().setCustomId("hoursAvailable").setLabel(questions[1]).setStyle(TextInputStyle.Short);
        const inputC = new TextInputBuilder().setCustomId("roles").setLabel(questions[2]).setStyle(TextInputStyle.Short);
        const inputD = new TextInputBuilder().setCustomId("academicYear").setLabel(questions[3]).setStyle(TextInputStyle.Short);
        const inputE = new TextInputBuilder().setCustomId("otherInfo").setLabel(questions[4]).setStyle(TextInputStyle.Paragraph);
        const actionRowA = new ActionRowBuilder<TextInputBuilder>().addComponents(inputA);
        const actionRowB = new ActionRowBuilder<TextInputBuilder>().addComponents(inputB);
        const actionRowC = new ActionRowBuilder<TextInputBuilder>().addComponents(inputC);
        const actionRowD = new ActionRowBuilder<TextInputBuilder>().addComponents(inputD);
        const actionRowE = new ActionRowBuilder<TextInputBuilder>().addComponents(inputE);
        this.addComponents(actionRowA, actionRowB, actionRowC, actionRowD, actionRowE).setCustomId(`lfp-${name}`).setTitle("LFP Form");
    }
}