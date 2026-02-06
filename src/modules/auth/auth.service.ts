import { db } from "@/infrastructure/database";
import { users } from "../user/user.schema"; 
import { refreshTokens } from "./user_tokens.schema";
import { AppError } from "../../middleware/error.middleware";
import { generateRefreshToken, generateToken, hashToken, verifyToken } from "@/utils/token";
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { TokenResponse } from "./auth.types";
import { config } from "../../config/env";

const googleClient = new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET
);

class AuthService {
    private async _generateAuthResponse(user: typeof users.$inferSelect, device: string): Promise<TokenResponse> {
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        const hashedRefreshToken = hashToken(refreshToken);

        await db.insert(refreshTokens).values({
            userId: user.id,
            tokenHash: hashedRefreshToken,
            device: device || 'Unknown Device',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari
        });

        await db.update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

        return { refreshToken, accessToken };
    }

    loginWithGoogle = async (idToken: string, device: string) => {
        let ticket;
        try {
            ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (error) {
            throw new AppError(401, 'Invalid Google Token');
        }

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new AppError(400, 'Google account validation failed');
        }

        const { email, name, sub: googleId, picture } = payload;

        let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            [user] = await db.insert(users).values({
                email: email,
                name: name || 'User',
                password: null,
                googleId: googleId,
                authProvider: 'google',
                avatar: picture
            }).returning();
        } else {
            if (!user.googleId) {
                await db.update(users)
                    .set({ googleId: googleId, authProvider: 'google' })
                    .where(eq(users.id, user.id));
            }
        }

        return this._generateAuthResponse(user!, device);
    }

    login = async (data: any) => {
        const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

        if (!user) {
            throw new AppError(404, 'User not found');
        }


        if (!user.password) {
            throw new AppError(400, 'Please login with Google');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid password');
        }

        return this._generateAuthResponse(user, data.device);
    }

    register = async (data: any) => {
        const [existingUser] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

        if (existingUser) {
            throw new AppError(400, 'User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=128`;

        const [user] = await db.insert(users).values({
            email: data.email,
            name: data.name,
            password: hashedPassword,
            authProvider: 'local',
            avatar: defaultAvatarUrl,
        }).returning();

        if (!user) {
            throw new AppError(500, 'Failed to create user');
        }

        return this._generateAuthResponse(user, data.device);
    }

    refresh = async (token: string) => {
        if (!token) throw new AppError(401, 'No token provided');

        const decodedToken = verifyToken(token);
        if (!decodedToken) throw new AppError(401, 'Invalid token signature');

        const incomingTokenHash = hashToken(token);

        const [storedRefreshToken] = await db.select()
            .from(refreshTokens)
            .where(and(
                eq(refreshTokens.tokenHash, incomingTokenHash),
                eq(refreshTokens.revoked, false)
            ))
            .limit(1);

        if (!storedRefreshToken) {
            throw new AppError(401, 'Refresh token reuse detected or invalid');
        }

        if (new Date() > storedRefreshToken.expiresAt) {
            await db.delete(refreshTokens).where(eq(refreshTokens.id, storedRefreshToken.id));
            throw new AppError(401, 'Refresh token expired');
        }

        await db.delete(refreshTokens).where(eq(refreshTokens.id, storedRefreshToken.id));

        const [user] = await db.select().from(users).where(eq(users.id, storedRefreshToken.userId)).limit(1);
        if (!user) throw new AppError(404, 'User not found');

        return this._generateAuthResponse(user, storedRefreshToken.device || 'Unknown');
    }

    logout = async (refreshTokenString: string) => {
        if (!refreshTokenString) throw new AppError(400, "Token required");
        const tokenHashToFind = hashToken(refreshTokenString);

        await db.delete(refreshTokens)
            .where(eq(refreshTokens.tokenHash, tokenHashToFind));

        return { success: true };
    }
}

export const authService = new AuthService();