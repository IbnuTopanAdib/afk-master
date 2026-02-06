import { z } from 'zod';

/**
 * Validation schema for creating a new user
 * 
 * Architecture Note:
 * - Validation schemas are separate from database schemas
 * - This allows different validation rules for different operations
 * - Zod provides runtime validation and TypeScript type inference
 */
export const createUserSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required')
        .max(255, 'Email must be less than 255 characters'),
    name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name must be less than 255 characters')
        .trim(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(255, 'Password must be less than 255 characters'),
});

/**
 * Validation schema for updating a user
 * All fields are optional for partial updates
 */
export const updateUserSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters')
        .optional(),
    name: z
        .string()
        .min(1, 'Name cannot be empty')
        .max(255, 'Name must be less than 255 characters')
        .trim()
        .optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(255, 'Password must be less than 255 characters')
        .optional(),
});

/**
 * Validation schema for user ID parameter
 * Ensures the ID is a valid UUID
 */
export const userIdSchema = z.object({
    id: z.string().uuid('Invalid user ID format'),
});

/**
 * Type inference from validation schemas
 * These types can be used in controllers and services
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
