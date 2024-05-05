import crypto from "crypto";
import mailer from "nodemailer";
import {GuildMember, ModalSubmitInteraction} from "discord.js";
import Student from "../../shared/models/student.ts";

export class Verifier {
    private static readonly timer = 870000;
    private static timeouts: Map<string, Timeout> = new Map();

    public static insert(student: Student, interaction: ModalSubmitInteraction) {
        if (student.verified) return;
        const timeout = global.setTimeout(Verifier.timeout, Verifier.timer, student.id, interaction);
        Verifier.timeouts.set(student.id, new Timeout(timeout, interaction));
    }

    public static fetch(id: Id) {
        return Verifier.timeouts.get(id);
    }

    public static remove(id: Id): Timeout | null {
        const entry = Verifier.timeouts.get(id);
        if (!entry) return null;
        Verifier.timeouts.delete(id);
        clearTimeout(entry.timeout);
        return entry;
    }

    private static timeout(id: Id, interaction: ModalSubmitInteraction) {
        Verifier.timeouts.delete(id);
        interaction.followUp({content: `Hey <@${id}>, your verification email has timed out. Please click the **Purdue Button** to send another one.`, ephemeral: true}).catch(console.log);
    }

    public static async registerNewStudent(interaction: ModalSubmitInteraction, member: GuildMember, email: string, roleId: Id) {
        const student = await new Student(member.id, member.user.username, email, false).save();
        const hash = Verifier.encrypt(`${member.id}-${roleId}-${Date.now()}`);
        const token = hash.iv + "-" + hash.content;
        const url = `${Bun.env.BACKEND_HOST}/students/verify/${token}`;
        await Verifier.sendEmail(email, url);
        Verifier.insert(student, interaction);
    }

    public static async sendEmail(address: string, link: string) {
        const transporter = mailer.createTransport({
            service: "gmail",
            auth: {
                user: Bun.env.EMAIL_USERNAME,
                pass: Bun.env.EMAIL_PASSWORD
            }
        });

        const options = {
            from: Bun.env.EMAIL_USERNAME,
            to: address,
            subject: "Discord Email Verification",
            html: emailHTML(link)
        };

        await transporter.sendMail(options);
    }

    public static encrypt(text: string) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(Bun.env.CYPHER, Bun.env.AUTHORIZATION, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return {iv: iv.toString("hex"), content: encrypted.toString("hex")};
    }
}

class Timeout {
    public readonly timeout: NodeJS.Timeout;
    public readonly interaction: ModalSubmitInteraction;

    constructor(timeout: NodeJS.Timeout, interaction: ModalSubmitInteraction) {
        this.timeout = timeout;
        this.interaction = interaction;
    }
}

const emailHTML = (link: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PUGG Email Verification</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #1B1B1B;
                color: #E8E8E8;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: #2A2A2A;
                border: 1px solid #333;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .email-header {
                background-color: #333;
                color: #D0BA92;
                padding: 20px;
                text-align: center;
            }
            .email-body {
                padding: 20px;
                line-height: 1.5;
            }
            .highlight {
                color: #D0BA92;
            }
            .email-footer {
                text-align: center;
                padding: 10px;
                font-size: 0.8em;
                color: #E8E8E8;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>PUGG Email Verification</h1>
            </div>
            <div class="email-body">
                <p>Please use the link below to finish verification:</p>
                <p><strong>Verification Link:</strong> <a href="${link}" class="highlight">${link}</a></p>
            </div>
            <div class="email-footer">
                This is an automated message. Please do not reply directly to this email.
            </div>
        </div>
    </body>
    </html>`
}