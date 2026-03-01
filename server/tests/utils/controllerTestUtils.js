import { vi } from 'vitest';

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

import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

export { pool, bcrypt };

export const createRes = () => ({
    statusCode: 200,
    payload: null,
    cookies: [],
    clearedCookies: [],
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        this.payload = data;
        return this;
    },
    cookie(name, value, options) {
        this.cookies.push({ name, value, options });
        return this;
    },
    clearCookie(name, options) {
        this.clearedCookies.push({ name, options });
        return this;
    }
});

export const createReq = (overrides = {}) => ({
    query: {},
    params: {},
    body: {},
    user: { id: 1, brokerId: 'bro-test' },
    ...overrides
});

export const mockQuery = () => pool.query;
