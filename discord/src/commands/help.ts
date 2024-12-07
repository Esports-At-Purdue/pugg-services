import {
    ApplicationCommand,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    Collection,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";
import Command from "../command.ts";
import {ephemeralReply} from "../utils/interaction.ts";

const builder = new SlashCommandBuilder()
    .setName("help")
    .setDescription("display command info")
    .addStringOption((string) => string
        .setName("command")
        .setDescription("view specific command info")
        .setRequired(false)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    const client = interaction.client;
    const filter = interaction.options.getString("command")?.toLowerCase() ?? "";

    if (!guild) throw new Error("Guild not found");

    const guildCommands = await guild.commands.fetch();
    const globalCommands = await client.application?.commands.fetch();

    const description = parseCommands(globalCommands, filter).concat("\n").concat(parseCommands(guildCommands, filter));
    const embed = new EmbedBuilder().setDescription(description).setTitle("Help Menu").setColor("#5a69ea");
    await ephemeralReply(interaction, { embeds: [ embed ] });
}

function parseCommands(commands: Collection<string,  ApplicationCommand>, filter: string) {
    return Array.from(commands.values())
        .filter(command => command.name.includes(filter))
        .sort((a, b) => {
            if (a.name > b.name) return  1;
            if (a.name < b.name) return -1;
            return 0;
        })
        .map(command => {
            const options = command.options
                .filter(option => {
                    return (option.type == ApplicationCommandOptionType.SubcommandGroup || option.type == ApplicationCommandOptionType.Subcommand);
                });

            if (options.length < 1) {
                return `</${(command.name)}:${command.id}> - ${command.description}\n`;
            }

            return `**/${toTitleCase(command.name)}** - ${command.description}\n`.concat(
                options
                    .map(option => {
                        if (option.type == ApplicationCommandOptionType.Subcommand) {
                            return `⠀⠀</${command.name} ${option.name}:${command.id}> - ${option.description}\n`
                        }
                        if (option.type == ApplicationCommandOptionType.SubcommandGroup) {
                            return option.options?.map(subcommand => {
                                return `⠀⠀</${command.name} ${option.name} ${subcommand.name}:${command.id}> - ${subcommand.description}\n`;
                            }).join("")
                        }
                    }).join("")
            );
        }).join("\n");
}

function toTitleCase(title: string) {
    return title.replace(
        /\w\S*/g,
        function(text) {
            return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
        }
    );
}

export default class HelpCommand extends Command {
    constructor() {
        super(false, builder, execute);
    }
}

/*
return `</${(command.name)}:${command.id}> - ${command.description}\n`.concat(
                command.options
                    .map(option => {
                        if (option.type == ApplicationCommandOptionType.SubcommandGroup) {
                            return option.options?.map(subcommand => {
                                return `⠀⠀</${command.name} ${option.name} ${subcommand.name}:${command.id}> - ${subcommand.description}`.concat(
                                    subcommand.options?.map(subcommandOption => {
                                        if (subcommandOption.required) {
                                            return `\n⠀⠀⠀⠀***${subcommandOption.name}*** - ${subcommandOption.description}`;
                                        } else {
                                            return `\n⠀⠀⠀⠀**[${subcommandOption.name}]** - ${subcommandOption.description}`;
                                        }
                                    }).join("") ?? ``
                                );
                            }).join("\n");
                        }

                        if (option.type == ApplicationCommandOptionType.Subcommand) {
                            return `⠀⠀</${command.name} ${option.name}:${command.id}> - ${option.description}`.concat(
                                option.options?.map(subcommandOption => {
                                    if (subcommandOption.required) {
                                        return `\n⠀⠀⠀⠀***${subcommandOption.name}*** - ${subcommandOption.description}`;
                                    } else {
                                        return `\n⠀⠀⠀⠀**[${subcommandOption.name}]** - ${subcommandOption.description}`;
                                    }
                                }).join("") ?? ``
                            );
                        }

                        if (option.required) {
                            return `⠀⠀⠀⠀***${option.name}*** - ${option.description}`;
                        } else {
                            return `⠀⠀⠀⠀**[${option.name}]** - ${option.description}`;
                        }
                    })
                    .join("\n")
            ).concat(command.options.length > 0 ? '\n' : '')
 */