import Database from "../../shared/database.ts";
import express from "express";
import process from "process";
import cors from "cors";
import StudentRouter from "./routes/student.router.ts";
import BotRouter from "./routes/bot.router.ts";
import TicketRouter from "./routes/ticket.router.ts";
import MessageRouter from "./routes/message.router.ts";
import AuthRouter from "./routes/auth.router.ts";
import DefaultRouter from "./routes/default.router.ts";
import cookieParser from "cookie-parser";



Database.connect().then(async () => {
    const app = express();
    app.use(cors())
    app.use(cookieParser())
    app.use("", new DefaultRouter().router);
    app.use("/auth", new AuthRouter().router);
    app.use("/bots", new BotRouter().router);
    app.use("/students", new StudentRouter().router);
    app.use("/tickets", new TicketRouter().router);
    app.use("/messages", new MessageRouter().router);
    app.listen(Bun.env.BACKEND_PORT);
    console.log(`Listening on ${Bun.env.BACKEND_PORT}`);
});

console.log(`Backend: ${process.pid}`);