import {BotName} from "../../shared/models/bot.ts";
import {SlashCommandBuilder} from "discord.js";

export default class Command {
    public name: CommandName;
    public global: boolean;
    public restricted: boolean;
    public builder: SlashCommandBuilder;
    public execute: Function;
    public botName?: BotName;

    constructor(name: CommandName, global: boolean, restricted: boolean, builder: any, execute: Function, botName?: BotName) {
        this.name = name;
        this.global = global;
        this.restricted = restricted;
        this.builder = builder;
        this.execute = execute;
    }
}