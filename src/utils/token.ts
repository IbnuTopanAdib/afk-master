import { User } from "@/modules/user/user.schema";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { Response } from "express";
import crypto from "crypto";

export const generateToken = (user: User) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        config.ACCESS_SECRET,
        { expiresIn: "15m" }
    );
}

export const generateRefreshToken = (user: User) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        config.REFRESH_SECRET,
        { expiresIn: "7d" }
    );
}

export function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, config.REFRESH_SECRET);
}

export const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}