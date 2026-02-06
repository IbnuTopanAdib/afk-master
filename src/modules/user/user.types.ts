import { User } from './user.schema';
import { CreateUserInput, UpdateUserInput } from './user.validation';

/**
 * User response DTO (Data Transfer Object)
 * Omits sensitive fields like password from API responses
 */
export type UserResponse = Omit<User, 'password'>;

/**
 * Service layer types
 */
export type CreateUserData = CreateUserInput;
export type UpdateUserData = UpdateUserInput;
