import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { db } from '../../infrastructure/database';
import { users } from './user.schema';
import { CreateUserData, UpdateUserData, UserResponse } from './user.types';
import { AppError } from '../../middleware/error.middleware';

/**
 * User Service
 * 
 * Architecture Note:
 * - Contains all business logic for user operations
 * - Interacts directly with Drizzle ORM (no repository layer)
 * - Throws AppError for business logic violations
 * - Returns data without password field for security
 */
class UserService {
    /**
     * Create a new user
     * - Validates email uniqueness
     * - Hashes password before storage
     * - Returns user without password
     */
    async create(data: CreateUserData): Promise<UserResponse> {
        // Check if email already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

        if (existingUser.length > 0) {
            throw new AppError(409, 'Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Insert user
        const [newUser] = await db
            .insert(users)
            .values({
                email: data.email,
                name: data.name,
                password: hashedPassword,
                updatedAt: new Date(),
            })
            .returning();

        if (!newUser) {
            throw new AppError(500, 'Failed to create user');
        }

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    /**
     * Get all users
     * - Returns all users without passwords
     */
    async getAll(): Promise<UserResponse[]> {
        const allUsers = await db.select().from(users);

        // Remove password from all users
        return allUsers.map(({ password, ...user }) => user);
    }

    /**
     * Get user by ID
     * - Throws 404 if user not found
     * - Returns user without password
     */
    async getById(id: string): Promise<UserResponse> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Update user by ID
     * - Validates email uniqueness if email is being updated
     * - Hashes password if password is being updated
     * - Throws 404 if user not found
     * - Returns updated user without password
     */
    async update(id: string, data: UpdateUserData): Promise<UserResponse> {
        // Check if user exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!existingUser) {
            throw new AppError(404, 'User not found');
        }

        // If email is being updated, check uniqueness
        if (data.email && data.email !== existingUser.email) {
            const [emailExists] = await db
                .select()
                .from(users)
                .where(eq(users.email, data.email))
                .limit(1);

            if (emailExists) {
                throw new AppError(409, 'Email already exists');
            }
        }

        // Prepare update data
        const updateData: any = {
            ...data,
            updatedAt: new Date(),
        };

        // Hash password if it's being updated
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        // Update user
        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();

        if (!updatedUser) {
            throw new AppError(500, 'Failed to update user');
        }

        // Return user without password
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    /**
     * Delete user by ID
     * - Throws 404 if user not found
     * - Returns deleted user without password
     */
    async delete(id: string): Promise<UserResponse> {
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning();

        if (!deletedUser) {
            throw new AppError(404, 'User not found');
        }

        // Return deleted user without password
        const { password, ...userWithoutPassword } = deletedUser;
        return userWithoutPassword;
    }
}

// Export singleton instance
export const userService = new UserService();
