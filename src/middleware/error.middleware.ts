import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger.middleware';

/**
 * Custom application error class
 * Use this for throwing errors with specific HTTP status codes
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async error wrapper for route handlers
 * Wraps async route handlers to catch errors and pass them to error middleware
 * 
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Format Zod validation errors into a readable format
 */
const formatZodError = (error: ZodError) => {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
};

/**
 * Global error handling middleware
 * This should be the last middleware in the Express app
 * All errors from controllers and middleware will flow through here
 */
export const errorHandler = (
    err: Error | AppError | ZodError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Default error values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: any = undefined;

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        errors = formatZodError(err);
    }
    // Handle custom application errors
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle database errors (PostgreSQL)
    else if ('code' in err) {
        const dbError = err as any;
        switch (dbError.code) {
            case '23505': // Unique violation
                statusCode = 409;
                message = 'Resource already exists';
                break;
            case '23503': // Foreign key violation
                statusCode = 400;
                message = 'Invalid reference';
                break;
            case '23502': // Not null violation
                statusCode = 400;
                message = 'Required field missing';
                break;
            default:
                statusCode = 500;
                message = 'Database error';
        }
    }
    // Handle generic errors
    else if (err instanceof Error) {
        message = err.message;
    }

    // Log the error
    logger.error('Error occurred', {
        statusCode,
        message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        // Include stack trace only in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler
 * Use this before the error handler to catch undefined routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
    const error = new AppError(404, `Route ${req.originalUrl} not found`);
    next(error);
};
