import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Winston logger configuration
 * Logs to both console and file with different formats for each
 */
export const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'backend-api' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    ({ level, message, timestamp, ...metadata }) => {
                        let msg = `${timestamp} [${level}]: ${message}`;
                        if (Object.keys(metadata).length > 0) {
                            msg += ` ${JSON.stringify(metadata)}`;
                        }
                        return msg;
                    }
                )
            ),
        }),
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs to combined.log
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with method, URL, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    // Log when response is finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });
    });

    next();
};
