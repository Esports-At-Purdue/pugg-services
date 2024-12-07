import {ButtonInteraction, GuildMember, Role, StringSelectMenuInteraction} from "discord.js";
import Student from "../../../shared/models/student.ts";
import PurdueModal from "../modals/purdue.modal.ts";
import Bot from "../../../shared/models/bot.ts";
import {ephemeralReply} from "./interaction.ts";
import ShowModalComponent from "../components/show.modal.component.ts";

export default async function handleRoleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction, bot: Bot, member: GuildMember, role?: Role | null) {
    if (!role) {
        await ephemeralReply(interaction, { content: "Sorry, this is a legacy role and cannot be applied." });
        return;
    }

    if (role.id == bot.settings.roles.purdue) {
        await handlePurdueRole(interaction, member, role);
        return;
    }

    if (role.id == bot.settings.roles.member) {
        await handleMemberRole(interaction, member, role);
        return;
    }

    if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role.id);
        await ephemeralReply(interaction, { content: `You removed **<@&${role.id}>**` });
        return;
    }

    await member.roles.add(role.id);
    await ephemeralReply(interaction, { content: `You applied **<@&${role.id}>**` });
}

async function handlePurdueRole(interaction: ButtonInteraction | StringSelectMenuInteraction, member: GuildMember, role: Role) {
    const student = await Student.fetch(member.id);

    if (student?.verified) {
        await member.roles.add(role.id);
        await ephemeralReply(interaction, {content: `You are verified. Thank you!` });
        return;
    } else {
        await member.roles.remove(role.id);
        const showModal = new ShowModalComponent("purdue");
        await ephemeralReply(interaction, { content: "Click this button to open the form", components: [ showModal ]});
        return;
    }
}

async function handleMemberRole(interaction: ButtonInteraction | StringSelectMenuInteraction, member: GuildMember, role: Role) {
    if (member.roles.cache.has(role.id)) {
        await ephemeralReply(interaction, { content: "You already have this role" });
        return;
    }

    await member.roles.add(role.id);
    await ephemeralReply(interaction, {content: "Thank you, and welcome to the server!" });
}