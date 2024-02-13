import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";

export default class QuestionEditComponents extends ActionRowBuilder<StringSelectMenuBuilder> {
    public constructor(type: string, questions: string[]) {
        super();
        const stringSelectMenu = new StringSelectMenuBuilder().setCustomId(`sheets-${type}-edit`);

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            stringSelectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(q)
                    .setValue(i.toString())
            )
        }

        this.setComponents(stringSelectMenu);
    }
}