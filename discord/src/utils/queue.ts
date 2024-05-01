import Queue from "../queue.ts";
import {ButtonInteraction} from "discord.js";

export async function handleQueueAction(queue: Queue, action: QueueAction, interaction: ButtonInteraction) {
    switch (action) {
        case "join": {
            await queue.join(interaction.user, interaction);
        } break;

        case "leave": {
            await queue.leave(interaction.user, interaction);
        } break;
    }
}