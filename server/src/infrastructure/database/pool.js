import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database connection pool
 * Singleton instance for managing database connections
 */
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

export default pool;
