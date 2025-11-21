import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    // console.log('Connected to the PostgreSQL database');
});

export default pool;
