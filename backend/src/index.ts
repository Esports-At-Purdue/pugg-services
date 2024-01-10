import Database from "../../shared/database.ts";
import express from "express";
import process from "process";
import StudentRouter from "./routes/student.router.ts";
import BotRouter from "./routes/bot.router.ts";
import TicketRouter from "./routes/ticket.router.ts";
import MessageRouter from "./routes/message.router.ts";
import session from "express-session";
import Passport from "../passport.ts";
import AuthRouter from "./routes/auth.router.ts";

Database.connect().then(async () => {
    const app = express();
    const passport = new Passport();
    app.use(session({
        secret: '',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.passport.initialize());
    app.use(passport.passport.session());
    app.use("/auth", new AuthRouter(passport).router);
    app.use("/bots", new BotRouter().router);
    app.use("/students", new StudentRouter().router);
    app.use("/tickets", new TicketRouter().router);
    app.use("/messages", new MessageRouter().router);
    app.listen(Bun.env.BACKEND_PORT);
    console.log(`Listening on ${Bun.env.BACKEND_PORT}`);
});

console.log(`Backend: ${process.pid}`);