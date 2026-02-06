import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '../../config/env';

/**
 * PostgreSQL connection pool
 * Using the official pg driver for optimal performance
 */
const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

/**
 * Drizzle ORM instance
 * This is the main database client used throughout the application
 * Import this in services to interact with the database
 */
export const db = drizzle(pool);

/**
 * Test database connection
 * Call this on application startup to ensure database is accessible
 */
export const testConnection = async (): Promise<void> => {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('Database connection established successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};


export const closeConnection = async (): Promise<void> => {
    try {
        await pool.end();
        console.log('Database connections closed');
    } catch (error) {
        console.error('Error closing database connections:', error);
        throw error;
    }
};
