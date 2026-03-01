import { defineConfig } from 'vitest/config';
import path from 'node:path';
import dotenv from 'dotenv';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./server/tests/setup.js'],
        include: ['server/**/*.test.js'],
        exclude: ['src/**', '**/node_modules/**', '**/dist/**'],
        env: {
            JWT_SECRET: process.env.JWT_SECRET || 'test_secret',
            DATABASE_URL: process.env.DATABASE_URL,
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['server/**/*.js'],
            exclude: ['server/tests/**', 'server/scripts/**', 'server/config/**', '**/node_modules/**'],
            thresholds: {
                lines: 40,
                functions: 40,
                branches: 30,
                statements: 40,
            }
        }
    },
});
