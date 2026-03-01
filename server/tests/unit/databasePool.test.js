import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pg', () => {
    return {
        default: {
            Pool: vi.fn(function Pool() {
                return {
                    on: vi.fn()
                };
            })
        }
    };
});

vi.mock('fs', () => ({
    default: { readFileSync: vi.fn() }
}));

describe('Database pool singleton', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
        process.env.DATABASE_POOL_MAX = '15';
        process.env.DATABASE_POOL_IDLE_TIMEOUT_MS = '5000';
        process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS = '1500';
        process.env.NODE_ENV = 'test';
    });

    it('creates pg pool using DATABASE_URL', async () => {
        const { default: pg } = await import('pg');
        const module = await import('../../config/db.js');
        expect(pg.Pool).toHaveBeenCalledWith(
            expect.objectContaining({
                connectionString: 'postgres://user:pass@localhost:5432/db',
                max: 15,
                idleTimeoutMillis: 5000,
                connectionTimeoutMillis: 1500
            })
        );
        expect(module.default).toBeDefined();
    });
});
