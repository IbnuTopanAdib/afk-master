import { createApp } from './app';
import { config } from './config/env';
import { testConnection, closeConnection } from './infrastructure/database';
import { logger } from './middleware/logger.middleware';

/**
 * Server entry point
 * 
 * Architecture Note:
 * - Validates environment configuration
 * - Initializes database connection
 * - Starts HTTP server
 * - Handles graceful shutdown
 */
const startServer = async () => {
    try {
        // ============================================
        // Database Connection
        // ============================================
        logger.info('Connecting to database...');
        await testConnection();

        // ============================================
        // Create Express App
        // ============================================
        const app = createApp();

        // ============================================
        // Start HTTP Server
        // ============================================
        const server = app.listen(config.PORT, () => {
            logger.info(`🚀 Server is running on port ${config.PORT}`);
            logger.info(`📝 Environment: ${config.NODE_ENV}`);
            logger.info(`🔗 Health check: http://localhost:${config.PORT}/health`);
            logger.info(`👥 User API: http://localhost:${config.PORT}/api/users`);
        });

        // ============================================
        // Graceful Shutdown
        // ============================================
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            // Stop accepting new connections
            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    // Close database connections
                    await closeConnection();
                    logger.info('✅ Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
