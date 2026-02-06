# Validation Middleware Usage Guide

## Overview

The validation middleware provides a clean, reusable way to validate incoming requests using Zod schemas. It validates request body, params, and query parameters at the route level, before the request reaches the controller.

## Benefits

✅ **Separation of Concerns** - Validation logic is separated from controller logic
✅ **DRY Principle** - Reusable across all routes
✅ **Type Safety** - Leverages Zod's type inference
✅ **Centralized Error Handling** - Validation errors are automatically caught and formatted
✅ **Clean Controllers** - Controllers receive pre-validated data

## Basic Usage

### 1. Define Zod Schemas

```typescript
// user.validation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

export const userIdSchema = z.object({
  id: z.string().uuid(),
});
```

### 2. Apply Middleware to Routes

```typescript
// user.routes.ts
import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware';
import { createUserSchema, userIdSchema } from './user.validation';
import { userController } from './user.controller';

const router = Router();

// Validate request body
router.post('/', validate({ body: createUserSchema }), userController.create);

// Validate URL params
router.get('/:id', validate({ params: userIdSchema }), userController.getById);

// Validate both params and body
router.put(
  '/:id',
  validate({ params: userIdSchema, body: updateUserSchema }),
  userController.update
);

export default router;
```

### 3. Access Validated Data in Controller

```typescript
// user.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';

class UserController {
  create = asyncHandler(async (req: Request, res: Response) => {
    // req.body is already validated and typed
    const user = await userService.create(req.body);
    
    res.status(201).json({
      success: true,
      data: user,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    // req.params is already validated
    const { id } = req.params as { id: string };
    const user = await userService.getById(id);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  });
}
```

## Advanced Examples

### Validating Query Parameters

```typescript
// Define query schema
const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

// Apply to route
router.get(
  '/search',
  validate({ query: searchQuerySchema }),
  userController.search
);

// Use in controller
search = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = 1, limit = 10 } = req.query as {
    q: string;
    page?: number;
    limit?: number;
  };
  
  const results = await userService.search(q, page, limit);
  res.json({ success: true, data: results });
});
```

### Validating Multiple Parts

```typescript
// Validate params, body, and query simultaneously
router.post(
  '/:id/comments',
  validate({
    params: userIdSchema,
    body: createCommentSchema,
    query: paginationSchema,
  }),
  commentController.create
);
```

### Custom Validation Logic

```typescript
// Complex validation with refinements
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

## Error Handling

When validation fails, the middleware automatically passes the Zod error to the error handler middleware, which formats it into a user-friendly response:

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "String must contain at least 8 character(s)"
    }
  ]
}
```

## Type Safety

The validation middleware preserves type safety through Zod's type inference:

```typescript
// Define schema
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

// Infer TypeScript type
type CreateUserInput = z.infer<typeof createUserSchema>;

// Use in service
async create(data: CreateUserInput): Promise<User> {
  // data is fully typed: { email: string; name: string }
  return await db.insert(users).values(data);
}
```

## Best Practices

### ✅ DO

- Define validation schemas in separate `*.validation.ts` files
- Use the validation middleware at the route level
- Keep controllers thin - they should only handle HTTP concerns
- Use type assertions in controllers for validated params
- Leverage Zod's transform and refine for complex validation

### ❌ DON'T

- Don't validate in controllers - use the middleware
- Don't duplicate validation logic
- Don't use `any` types - leverage Zod's type inference
- Don't catch validation errors manually - let the error middleware handle them

## Migration from Inline Validation

### Before (Inline Validation)

```typescript
// ❌ Old approach - validation in controller
create = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createUserSchema.parse(req.body);
  const user = await userService.create(validatedData);
  res.json({ success: true, data: user });
});
```

### After (Middleware Validation)

```typescript
// ✅ New approach - validation in middleware

// In routes file
router.post('/', validate({ body: createUserSchema }), userController.create);

// In controller
create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.json({ success: true, data: user });
});
```

## Complete Example

Here's a complete example of a product module using the validation middleware:

```typescript
// product.validation.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.object({
  id: z.string().uuid(),
});

export const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
});

// product.routes.ts
import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productQuerySchema,
} from './product.validation';
import { productController } from './product.controller';

const router = Router();

router.post('/', validate({ body: createProductSchema }), productController.create);
router.get('/', validate({ query: productQuerySchema }), productController.getAll);
router.get('/:id', validate({ params: productIdSchema }), productController.getById);
router.put(
  '/:id',
  validate({ params: productIdSchema, body: updateProductSchema }),
  productController.update
);
router.delete('/:id', validate({ params: productIdSchema }), productController.delete);

export default router;

// product.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { productService } from './product.service';

class ProductController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { category, minPrice, maxPrice } = req.query as {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    };
    const products = await productService.getAll({ category, minPrice, maxPrice });
    res.json({ success: true, data: products });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const product = await productService.getById(id);
    res.json({ success: true, data: product });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const product = await productService.update(id, req.body);
    res.json({ success: true, data: product });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await productService.delete(id);
    res.json({ success: true, message: 'Product deleted' });
  });
}

export const productController = new ProductController();
```

## Summary

The validation middleware provides a clean, type-safe way to validate requests in your Express application. By moving validation to the route level, you keep your controllers focused on HTTP concerns while maintaining full type safety and error handling.
