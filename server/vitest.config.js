import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Explicitly set environment variables to ensure they're available
// This must happen before any test files are imported
if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
    console.error('❌ FATAL: Environment variables not loaded in vitest.config.js');
    console.error('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully in vitest');
console.log('JWT_SECRET:', process.env.JWT_SECRET.substring(0, 10) + '...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        env: {
            JWT_SECRET: process.env.JWT_SECRET,
            DATABASE_URL: process.env.DATABASE_URL,
            NODE_ENV: 'test'
        },
        setupFiles: ['./tests/setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.test.js',
                '**/*.spec.js',
                'scripts/',
            ],
        },
    },
});
