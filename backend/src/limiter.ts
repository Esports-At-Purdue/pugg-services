import rateLimit from "express-rate-limit";
import {Request} from "express";

export default function Limiter() {
    return rateLimit({
        windowMs: 1000,
        limit: 1,
        standardHeaders: 'draft-7',
        legacyHeaders: false, skip: isWhitelisted
    })
}

function isWhitelisted(req: Request) {
    const authorization = req.headers.authorization;
    return (authorization == Bun.env.AUTHORIZATION);
}