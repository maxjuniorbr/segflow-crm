import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify critical environment variables are loaded
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET not loaded in test environment');
    console.error('process.env.JWT_SECRET:', process.env.JWT_SECRET);
}

if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL not loaded in test environment');
}
