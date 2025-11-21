import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

if (process.env.NODE_ENV === 'production') {
    console.error("❌ This script should NOT be run in production!");
    process.exit(1);
}

const dropAndRecreate = async () => {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL.replace('/segflow_crm', '/postgres'),
    });

    try {
        const client = await pool.connect();

        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'segflow_crm'
            AND pid <> pg_backend_pid()
        `);

        await client.query('DROP DATABASE IF EXISTS segflow_crm');
        await client.query('CREATE DATABASE segflow_crm');

        console.log("Database dropped and recreated successfully.");

        client.release();
    } catch (err) {
        console.error("Error resetting database:", err);
    } finally {
        await pool.end();
    }
};

dropAndRecreate();
