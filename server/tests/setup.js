import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('✅ Test Setup: Loaded env vars');
if (!process.env.DATABASE_URL) {
    console.error('❌ Test Setup: DATABASE_URL is missing!');
}
if (!process.env.JWT_SECRET) {
    console.error('❌ Test Setup: JWT_SECRET is missing!');
}
