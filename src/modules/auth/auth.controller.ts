import { asyncHandler } from "@/middleware/error.middleware";
import { Request, Response } from "express";
import { authService } from "./auth.service";

class AuthController {
    googleAuth = asyncHandler(async (req: Request, res: Response) => {

        const { idToken, device } = req.body;
        const user = await authService.loginWithGoogle(idToken, device);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: user,
        });
    })

    login = asyncHandler(async (req: Request, res: Response) => {
        const user = await authService.login(req.body);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: user,
        });
    })

    register = asyncHandler(async (req: Request, res: Response) => {
        const user = await authService.register(req.body);

        res.status(200).json({
            success: true,
            message: 'User registered successfully',
            data: user,
        });
    })

    logout = asyncHandler(async (req: Request, res: Response) => {
        const user = await authService.logout(req.body);

        res.status(200).json({
            success: true,
            message: 'User logged out successfully',
            data: user,
        });
    })

    refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const user = await authService.refresh(refreshToken);

        res.status(200).json({
            success: true,
            message: 'User refreshed token successfully',
            data: user,
        });
    })
}

export const authController = new AuthController();
