import {BotName} from "../../shared/models/bot.ts";
import {SlashCommandBuilder} from "discord.js";

export default class Command {
    public name:        CommandName;
    public restricted:  boolean;
    public builder:     SlashCommandBuilder;
    public execute:     Function;
    public botName?:    BotName;

    constructor(restricted: boolean, builder: any, execute: Function, botName?: BotName) {
        this.restricted = restricted;
        this.name = builder.name;
        this.builder = builder;
        this.execute = execute;
        this.botName = botName;
    }
}