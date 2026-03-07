import dotenv from 'dotenv';
import path from 'node:path';
import { vi } from 'vitest';
import { setupTestDb } from './utils/testDbMock.js';

// Load test env without polluting the test output with dotenv banners.
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

setupTestDb();

vi.spyOn(console, 'error').mockImplementation(() => {});
