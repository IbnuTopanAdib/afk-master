import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string(),
    device: z.string(),
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    device: z.string(),
})

export const loginWithGoogleSchema = z.object({
    idToken: z.string(),
    device: z.string(),
})

export const logoutSchema = z.object({
    refreshToken: z.string(),
})

export const refreshTokenSchema = z.object({
    refreshToken: z.string(),
})
