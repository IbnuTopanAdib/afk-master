import { Request, Response } from 'express';
import { userService } from './user.service';
import { asyncHandler } from '../../middleware/error.middleware';

/**
 * User Controller
 * 
 * Architecture Note:
 * - Handles HTTP concerns only (request/response)
 * - Validation is handled at route level by validation middleware
 * - Delegates business logic to service layer
 * - All methods are wrapped with asyncHandler for error handling
 */
class UserController {
    /**
     * Create a new user
     * POST /api/users
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        // Request body is already validated by middleware
        const user = await userService.create(req.body);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
        });
    });

    /**
     * Get all users
     * GET /api/users
     */
    getAll = asyncHandler(async (_req: Request, res: Response) => {
        const users = await userService.getAll();

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
        });
    });

    /**
     * Get user by ID
     * GET /api/users/:id
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        // Request params are already validated by middleware
        const { id } = req.params as { id: string };
        const user = await userService.getById(id);

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
        });
    });

    /**
     * Update user by ID
     * PUT /api/users/:id
     */
    update = asyncHandler(async (req: Request, res: Response) => {
        // Request params and body are already validated by middleware
        const { id } = req.params as { id: string };
        const user = await userService.update(id, req.body);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    });

    /**
     * Delete user by ID
     * DELETE /api/users/:id
     */
    delete = asyncHandler(async (req: Request, res: Response) => {
        // Request params are already validated by middleware
        const { id } = req.params as { id: string };
        const user = await userService.delete(id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: user,
        });
    });
}

// Export singleton instance
export const userController = new UserController();
