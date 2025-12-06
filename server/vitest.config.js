import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test_secret_key';
}

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://test-db-url';
}

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
