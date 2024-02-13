import {ChatInputCommandInteraction, SlashCommandBuilder, ActivityType} from "discord.js";
import Bot from "../../../shared/models/bot.ts";
import Command from "../command.ts";

const builder = new SlashCommandBuilder()
    .setName("status")
    .setDescription("status")
    .addIntegerOption((integer) => integer
        .setName("activity_type")
        .setDescription("The type of activity")
        .setRequired(true)
        .setChoices(
            {name: "Playing", value: 0},
            {name: "Streaming", value: 1},
            {name: "Listening", value: 2},
            {name: "Watching", value: 3},
            {name: "Competing", value: 5}
        )
    )
    .addStringOption(option => option
        .setName("activity_name")
        .setDescription("The name of the activity")
        .setRequired(true)
    );


async function execute(interaction: ChatInputCommandInteraction, bot: Bot) {
    const activityName = interaction.options.getString("activity_name") as string;
    const activityType = interaction.options.getInteger("activity_type") as ActivityType;

    bot.settings.status = { name: activityName, type: activityType };
    await bot.save();

    await interaction.reply({ content: "Success", ephemeral: true });
}

export default class StatusCommand extends Command {
    constructor() {
        super("status", true, true, builder, execute);
    }
}