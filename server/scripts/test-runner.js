#!/usr/bin/env node
/**
 * Test runner wrapper that ensures environment variables are loaded
 * before vitest imports any modules. This prevents the pool.js singleton
 * from initializing with undefined env vars.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly before running vitest
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify critical variables are set
if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET not found in .env');
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error('❌ FATAL: DATABASE_URL not found in .env');
    process.exit(1);
}

console.log('✅ Environment variables loaded for tests');

// Run vitest with all env vars passed through
const vitest = spawn('vitest', process.argv.slice(2), {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'test'
    }
});

vitest.on('exit', (code) => {
    process.exit(code);
});
