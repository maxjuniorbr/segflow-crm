import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pg', () => {
    return {
        default: {
            Pool: vi.fn(() => ({
                on: vi.fn()
            }))
        }
    };
});

describe('Database pool singleton', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    });

    it('creates pg pool using DATABASE_URL', async () => {
        const { default: pg } = await import('pg');
        const module = await import('../../src/infrastructure/database/pool.js');
        expect(pg.Pool).toHaveBeenCalledWith({
            connectionString: 'postgres://user:pass@localhost:5432/db'
        });
        expect(module.default).toBeDefined();
    });
});
