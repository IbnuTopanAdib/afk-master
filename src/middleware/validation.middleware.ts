import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validation middleware factory
 * Creates a middleware that validates request data using Zod schemas
 * 
 * Usage:
 * router.post('/users', validate({ body: createUserSchema }), userController.create);
 * router.get('/users/:id', validate({ params: userIdSchema }), userController.getById);
 * 
 * @param schemas - Object containing Zod schemas for body, params, and/or query
 * @returns Express middleware function
 */
export const validate = (schemas: {
    body?: AnyZodObject;
    params?: AnyZodObject;
    query?: AnyZodObject;
}) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validate request body if schema provided
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }

            // Validate request params if schema provided
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }

            // Validate request query if schema provided
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }

            // If all validations pass, continue to next middleware
            next();
        } catch (error) {
            // If validation fails, pass error to error handler middleware
            if (error instanceof ZodError) {
                next(error);
            } else {
                next(error);
            }
        }
    };
};
