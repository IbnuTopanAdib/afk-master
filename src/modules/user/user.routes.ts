import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validation.middleware';
import { createUserSchema, updateUserSchema, userIdSchema } from './user.validation';

/**
 * User routes
 * 
 * Architecture Note:
 * - Defines RESTful endpoints for user operations
 * - Routes are mounted at /api/users in the main app
 * - Validation is handled at route level using validation middleware
 * - Controllers receive pre-validated data
 */
const router = Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', validate({ body: createUserSchema }), userController.create);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', userController.getAll);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', validate({ params: userIdSchema }), userController.getById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Public
 */
router.put(
    '/:id',
    validate({ params: userIdSchema, body: updateUserSchema }),
    userController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Public
 */
router.delete('/:id', validate({ params: userIdSchema }), userController.delete);

export default router;

