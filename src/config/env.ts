import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment configuration schema using Zod
 * This ensures all required environment variables are present and valid
 * The application will fail fast on startup if configuration is invalid
 */
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    ACCESS_SECRET: z.string(),
    REFRESH_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
});

/**
 * Parse and validate environment variables
 * This will throw an error if validation fails
 */
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('Invalid environment variables:');
        console.error(JSON.stringify(result.error.format(), null, 2));
        throw new Error('Environment validation failed');
    }

    return result.data;
};

/**
 * Typed configuration object
 * Export this to access environment variables throughout the application
 */
export const config = parseEnv();

/**
 * Type definition for the configuration
 * Useful for type checking in other modules
 */
export type Config = z.infer<typeof envSchema>;
