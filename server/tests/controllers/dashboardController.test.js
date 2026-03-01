import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/db.js', () => {
    const queryFn = vi.fn();
    return {
        default: {
            query: queryFn,
            connect: vi.fn().mockResolvedValue({
                query: queryFn,
                release: vi.fn(),
            })
        }
    };
});

vi.mock('bcryptjs', () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn()
    }
}));

import { createRes, createReq } from '../utils/controllerTestUtils.js';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

import { getDashboardStats } from '../../controllers/dashboardController.js';

beforeEach(() => {
    vi.clearAllMocks();
    pool.query.mockReset();
    bcrypt.genSalt.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
});

describe('Dashboard Controller', () => {
    it('returns dashboard stats with broker isolation', async () => {
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [{ totalClients: '10', activePolicies: '5' }] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createRes();
        await getDashboardStats(createReq(), res);

        expect(res.statusCode).toBe(200);
        expect(res.payload.totalClients).toBe(10);

        const firstCallArgs = querySpy.mock.calls[0];
        expect(firstCallArgs[1][0]).toBe('bro-test');

        const secondCallArgs = querySpy.mock.calls[1];
        expect(secondCallArgs[1][0]).toBe('bro-test');
    });

    it('handles dashboard error', async () => {
        pool.query.mockRejectedValueOnce(new Error('fail'));
        const res = createRes();
        await getDashboardStats(createReq(), res);
        expect(res.statusCode).toBe(500);
    });
});
