import {StringSelectMenuInteraction} from "discord.js";
import {google} from "googleapis";
import QuestionEditComponents from "../components/question.edit.components.ts";
import SheetsRowModal from "../modals/sheets.row.modal.ts";
import QuestionModal from "../modals/question.modal.ts";
import ShowModalComponent from "../components/show.modal.component.ts";
import {ephemeralReply} from "./interaction.ts";

enum Type {
    Lft = "lft",
    Lfp = "lfp"
}

enum Value {
    Edit = "edit",
    Row = "row"
}

enum Option {
    Options = "options",
    Edit = "edit"
}

export default async function handleSheetsInteraction(interaction: StringSelectMenuInteraction, type: string, value: string, option: string) {
    if (option == Option.Options) await handleOptions(interaction, type, value);
    if (option == Option.Edit) await handleEdit(interaction, type, value);
}

async function handleOptions(interaction: StringSelectMenuInteraction, type: string, value: string) {
    if (value == Value.Edit) {
        const questions = await fetchSheetQuestions(type);

        if (!questions) {
            await ephemeralReply(interaction, { content: "Spreadsheet Data Not Found" });
            return;
        }

        const menu = new QuestionEditComponents(type, questions);
        await ephemeralReply(interaction, { components: [ menu ] });
    }

    if (value == Value.Row) {
        const showModal = new ShowModalComponent("sheets", type);
        await ephemeralReply(interaction, { components: [ showModal ] });
    }
}

export async function fetchSheetQuestions(type: string) {
    const range = type == Type.Lft ? "LFT!C1:G1" : "LFP!C1:G1"
    const sheets = google.sheets("v4");
    const auth = await google.auth.getClient({
        keyFilename: "google.json",
        scopes: [ "https://www.googleapis.com/auth/spreadsheets" ]
    });
    const spreadsheet = await sheets.spreadsheets.values.get({
        spreadsheetId: Bun.env.GOOGLE_SHEETS_ID,
        range: range,
        auth: auth
    });

    return spreadsheet.data.values?.at(0);
}


async function handleEdit(interaction: StringSelectMenuInteraction, type: string, value: string) {
    const showModal = new ShowModalComponent("question", type, value);
    await ephemeralReply(interaction, { components: [ showModal ] });
}

