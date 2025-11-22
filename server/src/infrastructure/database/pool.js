import pg from 'pg';

/**
 * Database connection pool
 * Singleton instance for managing database connections
 * Note: Environment variables must be loaded before this module is imported
 */
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

export default pool;
