import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import Command from "../../command.ts";
import {BotName} from "../../../../shared/models/bot.ts";
import {faceitAxios} from "../../../../shared/axios/faceit.axios.ts";
import FaceitPlayerEmbed from "../../embeds/faceit.player.embed.ts";
import NodeCache from "node-cache";
import {ephemeralReply, reply} from "../../utils/interaction.ts";

const playerCache = new NodeCache({ stdTTL: 60, checkperiod: 5 });

const builder = new SlashCommandBuilder()
    .setName('faceit')
    .setDescription('lookup faceit player stats')
    .addStringOption((string) => string
        .setName("name")
        .setDescription("the name of the player")
        .setRequired(true)
    )

async function execute(interaction: ChatInputCommandInteraction) {

    const nickname = interaction.options.getString("name", true);
    const cachedPlayer = playerCache.get(nickname) as FaceitPlayer;

    if (cachedPlayer != undefined) {
        const embed = new FaceitPlayerEmbed(cachedPlayer)
        await reply(interaction, { embeds: [ embed ] });
        return;
    }

    try {
        const response = await faceitAxios.get(`/players?nickname=${nickname}&game=CSGO`)
        const player = response.data as FaceitPlayer;
        playerCache.set(nickname, player);
        const embed = new FaceitPlayerEmbed(player);
        await reply(interaction, { embeds: [ embed ] });
        return;
    } catch (e) {
        console.log("FaceIt fetch error", e);
        await ephemeralReply(interaction, { content: `Unable to retrieve faceit profile for ${nickname}` });
        return;
    }
}

export default class FaceitCommand extends Command {
    constructor() {
        super(false, builder, execute, BotName.CSGO);
    }
}