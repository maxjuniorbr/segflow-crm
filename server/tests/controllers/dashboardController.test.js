import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/db.js');
vi.mock('bcryptjs');

import { createRes, createReq, resetControllerMocks } from '../utils/controllerTestUtils.js';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

import { getDashboardStats } from '../../controllers/dashboardController.js';

beforeEach(() => {
    resetControllerMocks(pool, bcrypt);
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
