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

import { changePassword } from '../../controllers/passwordController.js';

beforeEach(() => {
    vi.clearAllMocks();
    pool.query.mockReset();
    bcrypt.genSalt.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
});

describe('Password Controller', () => {
    const baseReq = {
        params: { id: '1' },
        body: { currentPassword: 'SenhaForte123', newPassword: 'NovaSenhaForte1' },
        user: { id: '1', brokerId: 'bro-test' }
    };

    it('rejects when user not authenticated', async () => {
        const res = createRes();
        await changePassword(createReq({ ...baseReq, user: null }), res);
        expect(res.statusCode).toBe(401);
    });

    it('rejects when user tries to change another account', async () => {
        const res = createRes();
        await changePassword(createReq({ ...baseReq, user: { id: '2', brokerId: 'bro-test' } }), res);
        expect(res.statusCode).toBe(403);
    });

    it('validates payload rules', async () => {
        const resMissing = createRes();
        await changePassword(createReq({ ...baseReq, body: { currentPassword: '', newPassword: '' } }), resMissing);
        expect(resMissing.statusCode).toBe(400);

        const resSame = createRes();
        await changePassword(createReq({ ...baseReq, body: { currentPassword: 'a', newPassword: 'a' } }), resSame);
        expect(resSame.statusCode).toBe(400);

        const resWeak = createRes();
        await changePassword(createReq({ ...baseReq, body: { currentPassword: 'a', newPassword: 'short' } }), resWeak);
        expect(resWeak.statusCode).toBe(400);
    });

    it('rejects when user not found or password invalid', async () => {
        const querySpy = pool.query.mockResolvedValueOnce({ rows: [] });
        const resMissing = createRes();
        await changePassword(createReq(baseReq), resMissing);
        expect(resMissing.statusCode).toBe(404);

        querySpy.mockResolvedValueOnce({ rows: [{ password: 'hash' }] });
        bcrypt.compare.mockResolvedValueOnce(false);
        const resInvalid = createRes();
        await changePassword(createReq(baseReq), resInvalid);
        expect(resInvalid.statusCode).toBe(400);
    });

    it('changes password successfully', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ password: 'hash' }] })
            .mockResolvedValueOnce({ rows: [] });
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');

        const res = createRes();
        await changePassword(createReq(baseReq), res);
        expect(res.payload.message).toBe('Senha alterada com sucesso');
    });
});
