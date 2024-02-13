import crypto from "crypto";
import express, {Request, Response} from "express";
import Student from "../../../shared/models/student.ts";
import Protected from "../protected.ts";
import * as fs from "fs";
import axios from "axios";

export default class DefaultRouter {
    public readonly router;

    public constructor() {
        this.router = express.Router();
        this.router.use(express.json());
        this.router.get("/", this.get);
    }

    private async get(req: Request, res: Response) {
        console.log("Default Router");
        res.sendStatus(200);
    }
}