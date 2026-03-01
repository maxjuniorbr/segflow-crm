import pg from 'pg';
import fs from 'node:fs';
import { isDevelopment, isTest } from '../src/config/env.js';

const parseIntEnv = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getSslConfig = () => {
    if (isDevelopment || isTest) {
        return false;
    }
    if (process.env.DATABASE_CA_CERT_PATH) {
        return { ca: fs.readFileSync(process.env.DATABASE_CA_CERT_PATH, 'utf8') };
    }
    throw new Error(
        'FATAL: DATABASE_CA_CERT_PATH must be set in production. ' +
        'TLS without certificate verification is not allowed.'
    );
};

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseIntEnv(process.env.DATABASE_POOL_MAX, 20),
    idleTimeoutMillis: parseIntEnv(process.env.DATABASE_POOL_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMillis: parseIntEnv(process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS, 2000),
    ssl: getSslConfig()
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client:', err);
});

export default pool;
