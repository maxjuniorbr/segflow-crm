import dotenv from 'dotenv';
import path from 'node:path';
import { vi } from 'vitest';
import { setupTestDb } from './utils/testDbMock.js';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

setupTestDb();

vi.spyOn(console, 'error');
