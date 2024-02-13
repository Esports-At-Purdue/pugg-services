import {ButtonInteraction, GuildMember, Role, StringSelectMenuInteraction} from "discord.js";
import Student from "../../../shared/models/student.ts";
import PurdueModal from "../modals/purdue.modal.ts";
import Bot from "../../../shared/models/bot.ts";

export default async function handleRoleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction, bot: Bot, member: GuildMember, role?: Role | null) {
    if (!role) {
        await interaction.reply({ content: "Sorry, this is a legacy role and cannot be applied.", ephemeral: true });
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
        await interaction.reply({ content: `You removed **<@&${role.id}>**`, ephemeral: true});
        return;
    }

    await member.roles.add(role.id);
    await interaction.reply({ content: `You applied **<@&${role.id}>**`, ephemeral: true });
}

async function handlePurdueRole(interaction: ButtonInteraction | StringSelectMenuInteraction, member: GuildMember, role: Role) {
    const student = await Student.fetch(member.id);

    if (student?.verified) {
        await member.roles.add(role.id);
        await interaction.reply({content: `You are verified. Thank you!`, ephemeral: true});
        return;
    }

    await member.roles.remove(role.id);
    const modal = new PurdueModal();
    await interaction.showModal(modal);
}

async function handleMemberRole(interaction: ButtonInteraction | StringSelectMenuInteraction, member: GuildMember, role: Role) {
    if (member.roles.cache.has(role.id)) {
        await interaction.reply({ content: "You already have this role", ephemeral: true });
        return;
    }

    await member.roles.add(role.id);
    await interaction.reply({content: "Thank you, and welcome to the server!", ephemeral: true});
}