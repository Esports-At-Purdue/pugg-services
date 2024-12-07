import {GuildMember, ModalSubmitInteraction} from "discord.js";
import {Verifier} from "../verifier.ts";
import {google} from "googleapis";
import Bot from "../../../shared/models/bot.ts";
import {ephemeralReply} from "./interaction.ts";

class Base {
    public index: number;
    public name: string;
    public experience: string;
    public hours: string;
    public roles: string
    public year: string;
    public other: string;

    constructor(index: number, name: string, experience: string, hours: string, roles: string,  year: string, other: string) {
        this.index = index;
        this.name = name;
        this.experience = experience;
        this.hours = hours;
        this.roles = roles;
        this.year = year;
        this.other = other;
    }
}

class Player extends Base {
    public id: string;

    constructor(id: string, index: number, name: string, experience: string, hours: string, roles: string,  year: string, other: string) {
        super(index, name, experience, hours, roles, year, other);
        this.id = id;
    }
}

class Team extends Base {
    public ownerId: string;

    constructor(ownerId: string, index: number, name: string, experience: string, hours: string, roles: string, year: string, other: string) {
        super(index, name, experience, hours, roles, year, other);
        this.ownerId = ownerId;
    }
}

enum Type {
    Lft = "lft",
    Lfp = "lfp"
}

enum Option {
    Row = "row",
    Question = "q"
}

const scope = "https://www.googleapis.com/auth/spreadsheets";
const sheets = google.sheets("v4");
const auth = await google.auth.getClient({ keyFilename: "google.json", scopes: [ scope ] });

export async function handlePurdueModal(interaction: ModalSubmitInteraction, bot: Bot, member: GuildMember, email: string) {
    if (!isValidEmail(email)) {
        await ephemeralReply(interaction, {content: `Sorry, the address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.` });
        return;
    }

    if (!bot.settings.roles.purdue) {
        await ephemeralReply(interaction, { content: "Sorry, this feature is not supported" });
        return;
    }

    await Verifier.registerNewStudent(interaction, member, email, bot.settings.roles.purdue);
    await ephemeralReply(interaction, { content: `Sent a verification email to \`${email}\`` });
}

export async function handleLftModal(interaction: ModalSubmitInteraction, member: GuildMember) {
    const username = member.user.username;
    const experience = interaction.fields.getTextInputValue("experience");
    const hours = interaction.fields.getTextInputValue("hoursAvailable");
    const roles = interaction.fields.getTextInputValue("roles");
    const year = interaction.fields.getTextInputValue("academicYear");
    const other = interaction.fields.getTextInputValue("otherInfo");
    const player = await fetchLftPlayer(member.id);

    const content = "Output {\n" +
        `\t**Username**: ${username}\n\t**Experience**: ${experience}\n\t**Hours Available**: ${hours}\n` +
        `\t**Roles**: ${roles}\n\t**Year**: ${year}\n\t**Other Info**: ${other}\n` +
        "}";

    if (!player) {
        const player = new Player(member.id, 0, username, experience, hours, roles, year, other);
        await createLftPlayer(player);
        await ephemeralReply(interaction, { content: content });
        return;
    }

    await updateLftPlayer(new Player(player.id, player.index, username, experience, hours, roles, year, other));
    await ephemeralReply(interaction, { content: content });
}

export async function handleLfpModal(interaction: ModalSubmitInteraction, member: GuildMember, teamName: string) {
    const experience = interaction.fields.getTextInputValue("experience");
    const hours = interaction.fields.getTextInputValue("hoursAvailable");
    const roles = interaction.fields.getTextInputValue("roles");
    const year = interaction.fields.getTextInputValue("academicYear");
    const other = interaction.fields.getTextInputValue("otherInfo");
    const team = await fetchLfpTeam(teamName);
    const content = "Output {\n" +
        `\t**Team Name**: ${teamName}\n\t**Experience**: ${experience}\n\t**Hours Available**: ${hours}\n` +
        `\t**Roles**: ${roles}\n\t**Year**: ${year}\n\t**Other Info**: ${other}\n` +
        "}";

    if (!team) {
        const team = new Team(member.id, 0, teamName, experience, hours, roles, year, other);
        await createLfpTeam(team);
        await ephemeralReply(interaction, { content: content });
        return;
    }

    if (team.ownerId != member.id) {
        await ephemeralReply(interaction, { content: "Sorry, a team with this name already exists." });
        return;
    }

    await updateLfpTeam(new Team(team.ownerId, team.index, team.name, experience, hours, roles, year, other));
    await ephemeralReply(interaction, { content: content });
}

export async function handleSheetsModal(interaction: ModalSubmitInteraction, args: string[]) {
    const type = args[1];
    const option = args[2];

    if (option == Option.Row) {
        const row = Number.parseInt(interaction.fields.getTextInputValue(Option.Row));

        if (row < 2) {
            await ephemeralReply(interaction, { content: `Row \`${row}\` is an invalid choice` });
            return;
        }

        await deleteSheetRow(type, row);
        await ephemeralReply(interaction, { content: `Deleted row ${row}` });
    }

    if (option == Option.Question) {
        const index = Number.parseInt(args[3]);
        const question = interaction.fields.getTextInputValue("q");

        if (question.length > 45) {
            await ephemeralReply(interaction, { content: `Input greater than 45 characters: \`${question}\`` });
            return;
        }

        await editSheetQuestion(type, index, question);
        await ephemeralReply(interaction, { content: "Success" });
    }
}

async function fetchLftPlayer(id: string) {
    const spreadsheet = await sheets.spreadsheets.values.get({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: "LFT!A1:Z",
        auth: auth
    });

    for (const [ index, row ] of spreadsheet.data.values?.entries() ?? [  ]) {
        const rowId = row.at(0);
        if (rowId == id) {
            return new Player(row[0], index, row[1], row[2], row[3], row[4], row[5], row[6]);
        }
    }
}

async function fetchLfpTeam(name: string) {
    const spreadsheet = await sheets.spreadsheets.values.get({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: "LFP!A1:Z",
        auth: auth
    });

    for (const [ index, row ] of spreadsheet.data.values?.entries() ?? [  ]) {
        const rowId = row.at(0);
        if (rowId == name) {
            return new Team(row[0], index, row[1], row[2], row[3], row[4], row[5], row[6]);
        }
    }
}

async function createLftPlayer(player: Player) {
    await sheets.spreadsheets.values.append({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: "LFT!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [ [
                player.id,
                player.name,
                player.experience,
                player.hours,
                player.roles,
                player.year,
                player.other,
                new Date().toDateString()
            ] ]
        },
        auth: auth
    });
}

async function createLfpTeam(team: Team) {
    await sheets.spreadsheets.values.append({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: "LFP!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [ [
                team.ownerId,
                team.name,
                team.experience,
                team.hours,
                team.roles,
                team.year,
                team.other,
                new Date().toDateString()
            ] ]
        },
        auth: auth
    });
}

async function updateLftPlayer(player: Player) {
    await sheets.spreadsheets.values.update({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: `LFT!A${player.index}:Z${player.index}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            range: `LFT!A${player.index}:Z${player.index}`,
            majorDimension: "ROWS",
            values: [ [
                player.id,
                player.name,
                player.experience,
                player.hours,
                player.roles,
                player.year,
                player.other,
                new Date().toDateString()
            ] ]
        },
        auth: auth
    });
}

async function updateLfpTeam(team: Team) {
    await sheets.spreadsheets.values.update({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: `LFP!A${team.index}:Z${team.index}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            range: `LFP!A${team.index}:Z${team.index}`,
            majorDimension: "ROWS",
            values: [ [
                team.ownerId,
                team.name,
                team.experience,
                team.hours,
                team.roles,
                team.year,
                team.other,
                new Date().toDateString()
            ] ]
        },
        auth: auth
    });
}

async function deleteSheetRow(type: string, row: number) {
    const sheetId = type == Type.Lft ? 0 : 1405323068;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        requestBody: {
            requests: [
                {
                    deleteRange: {
                        range: {
                            sheetId: sheetId,
                            startRowIndex: row - 1,
                            endRowIndex: row
                        },
                        shiftDimension: "ROWS"
                    }
                }
            ]
        },
        auth: auth
    });
}

async function editSheetQuestion(type: string, index: number, question: string) {
    const letter = indexToLetter(index);
    const clearRange = type == Type.Lft ? `LFT!${letter}:${letter}` : `LFP!${letter}:${letter}`;
    const updateRange = type == Type.Lft ? `LFT!${letter}1` : `LFP!${letter}1`;


    await sheets.spreadsheets.values.clear({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: clearRange,
        auth: auth
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: updateRange,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            range: updateRange,
            majorDimension: "ROWS",
            values: [ [ question ] ]
        },
        auth: auth
    });
}

function isValidEmail(email: string) {
    const domains = [ "purdue.edu", "alumni.purdue.edu", "student.purdueglobal.edu" ]
    const addressRegex = /^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/;
    const addressDomain = email.split("@")[1];
    return addressRegex.test(email) && domains.some(domain => domain == addressDomain);
}

function indexToLetter(index: number) {
    if (index == 0) return 'C';
    if (index == 1) return 'D';
    if (index == 2) return 'E';
    if (index == 3) return 'F';
    if (index == 4) return 'G';
    throw new Error(`Unknown Index: ${index}`);
}