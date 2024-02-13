import express, {Request, Response} from "express";
import {Verifier} from "../verifier.ts";
import {Snowflake} from "discord.js";

export default class VerificationRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.post("/:studentId/:roleId", this.verifyStudent);
    }

    private async verifyStudent(req: Request, res: Response) {
        const { studentId, roleId } = req.params;

        const timeout = Verifier.fetch(studentId);
        const interaction = timeout?.interaction;
        const guild = interaction?.guild;
        const member = interaction?.member;

        if (!timeout || !interaction) {
            res.sendStatus(200);
            return;
        }

        if (!guild || !member) {
            res.sendStatus(400);
            return;
        }

        const guildMember = await guild.members.fetch(member.user.id);
        const role = await guild.roles.fetch(roleId);

        if (!role) {
            res.sendStatus(400);
            return;
        }

        await guildMember.roles.add(roleId as Snowflake);
        await interaction.followUp({ content: `Hey <@${studentId}>, you have successfully been verified. Thank you!`, ephemeral: true });
        Verifier.remove(studentId);

        res.sendStatus(200);
    }
}