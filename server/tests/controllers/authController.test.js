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

import { createRes } from '../utils/controllerTestUtils.js';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { buildBrokerRegistrationPayload } from '../utils/testFactories.js';

import { registerBroker, login, validate, logout } from '../../controllers/authController.js';

beforeEach(() => {
    vi.clearAllMocks();
    pool.query.mockReset();
    bcrypt.genSalt.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
});

describe('Auth Controller', () => {
    beforeEach(() => {
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');
        bcrypt.compare.mockResolvedValue(true);
    });

    it('registers broker with admin user successfully', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] }) // findBrokerByCnpj
            .mockResolvedValueOnce({ rows: [] }) // findBrokerBySusep
            .mockResolvedValueOnce({ rows: [] }) // findUserByEmail
            .mockResolvedValueOnce({ rows: [] }) // findUserByCpf
            .mockResolvedValueOnce({ rows: [] }) // createBroker
            .mockResolvedValueOnce({ rows: [] }); // createUser
        const res = createRes();
        await registerBroker({
            body: buildBrokerRegistrationPayload()
        }, res);
        expect(res.statusCode).toBe(201);
        expect(res.payload.message).toContain('Corretora cadastrada');
    });

    it('rejects duplicated email on broker registration', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] }) // findBrokerByCnpj
            .mockResolvedValueOnce({ rows: [] }) // findBrokerBySusep
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // findUserByEmail - email exists
        const res = createRes();
        await registerBroker({
            body: buildBrokerRegistrationPayload({
                email: 'dup@example.com',
                contactName: 'Dup User'
            })
        }, res);
        expect(res.statusCode).toBe(400);
    });

    it('rejects duplicated CNPJ on broker registration', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 'existing' }] }); // findBrokerByCnpj - CNPJ exists
        const res = createRes();
        await registerBroker({
            body: buildBrokerRegistrationPayload()
        }, res);
        expect(res.statusCode).toBe(400);
    });

    it('handles errors on registerBroker', async () => {
        pool.query.mockRejectedValueOnce(new Error('db fail'));
        const res = createRes();
        await registerBroker({
            body: buildBrokerRegistrationPayload({
                email: 'err@example.com',
                contactName: 'Err User'
            })
        }, res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('db fail');
    });

    it('logs user in and sets cookies', async () => {
        pool.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    email: 'user@example.com',
                    password: 'hash',
                    name: 'User',
                    cpf: '123',
                    broker_id: 'bro-test',
                    username: 'user'
                }]
            })
            .mockResolvedValueOnce({ rows: [], rowCount: 1 });
        bcrypt.compare.mockResolvedValueOnce(true);
        const res = createRes();
        await login({ body: { email: 'user@example.com', password: 'SenhaForte123' } }, res);
        expect(res.cookies).toHaveLength(2);
        expect(res.payload.user.isAuthenticated).toBe(true);
    });

    it('rejects login when user not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await login({ body: { email: 'missing@example.com', password: 'SenhaForte123' } }, res);
        expect(res.statusCode).toBe(401);
    });

    it('rejects login on incorrect password', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                email: 'user@example.com',
                password: 'hash',
                name: 'User',
                cpf: '123',
                username: 'user'
            }]
        });
        bcrypt.compare.mockResolvedValueOnce(false);
        const res = createRes();
        await login({ body: { email: 'user@example.com', password: 'errada' } }, res);
        expect(res.statusCode).toBe(401);
    });

    it('validates existing user', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                email: 'user@example.com',
                name: 'User',
                cpf: '123',
                username: 'user'
            }]
        });
        const res = createRes();
        await validate({ user: { id: 1, brokerId: 'bro-test' } }, res);
        expect(res.payload.valid).toBe(true);
    });

    it('returns 401 when validation user missing', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await validate({ user: { id: 1, brokerId: 'bro-test' } }, res);
        expect(res.statusCode).toBe(401);
    });

    it('clears cookies on logout', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
        const res = createRes();
        await logout({ user: { id: 1 }, headers: {} }, res);
        expect(res.clearedCookies).toHaveLength(2);
        expect(res.payload.message).toContain('Sessão encerrada');
    });
});
