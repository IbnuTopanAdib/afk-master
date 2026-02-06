import express, { Application } from 'express';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import userRoutes from './modules/user/user.routes';

/**
 * Express application setup
 * 
 * Architecture Note:
 * - This file configures the Express app but doesn't start the server
 * - Separation allows for easier testing
 * - Middleware order is important: logging → parsing → routes → error handling
 */
export const createApp = (): Application => {
    const app = express();

    // ============================================
    // Global Middleware
    // ============================================

    /**
     * Request logging
     * Logs all incoming HTTP requests
     */
    app.use(requestLogger);

    /**
     * Body parsing middleware
     * Parses JSON request bodies
     */
    app.use(express.json());

    /**
     * URL-encoded body parsing
     * Parses URL-encoded request bodies
     */
    app.use(express.urlencoded({ extended: true }));

    // ============================================
    // Health Check
    // ============================================

    /**
     * Health check endpoint
     * Used for monitoring and load balancer health checks
     */
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
        });
    });

    // ============================================
    // API Routes
    // ============================================

    /**
     * Mount module routes
     * All routes are prefixed with /api
     */
    app.use('/api/users', userRoutes);

    // ============================================
    // Error Handling
    // ============================================

    /**
     * 404 handler for undefined routes
     * Must be placed after all valid routes
     */
    app.use(notFoundHandler);

    /**
     * Global error handler
     * Must be the last middleware
     * Catches all errors from routes and middleware
     */
    app.use(errorHandler);

    return app;
};
