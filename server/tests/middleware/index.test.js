import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vi.fn()
    }
}));

import jwt from 'jsonwebtoken';
import { authMiddleware, validate } from '../../middleware/index.js';

const createRes = () => ({
    statusCode: 200,
    payload: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        this.payload = data;
        return this;
    }
});

describe('authMiddleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('accepts valid bearer token', () => {
        const req = { headers: { authorization: 'Bearer valid' } };
        const res = createRes();
        const next = vi.fn();
        jwt.verify.mockReturnValueOnce({ id: 1 });

        authMiddleware(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.id).toBe(1);
    });

    it('reads token from cookie', () => {
        const req = { headers: { cookie: 'segflow_token=cookie-token' } };
        const res = createRes();
        const next = vi.fn();
        jwt.verify.mockReturnValueOnce({ id: 2 });

        authMiddleware(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.id).toBe(2);
    });

    it('rejects when token missing', () => {
        const req = { headers: {} };
        const res = createRes();
        const next = vi.fn();

        authMiddleware(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.payload.error).toContain('Token não fornecido');
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid token', () => {
        const req = { headers: { authorization: 'Bearer invalid' } };
        const res = createRes();
        const next = vi.fn();
        jwt.verify.mockImplementationOnce(() => {
            throw new Error('invalid');
        });

        authMiddleware(req, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.payload.error).toContain('Token inválido');
    });
});

describe('validate middleware', () => {
    it('calls next when schema passes', () => {
        const schema = { parse: vi.fn() };
        const middleware = validate(schema);
        const req = { body: { ok: true } };
        const res = createRes();
        const next = vi.fn();

        middleware(req, res, next);
        expect(schema.parse).toHaveBeenCalledWith(req.body);
        expect(next).toHaveBeenCalled();
    });

    it('returns 400 on validation error', () => {
        const schema = { parse: vi.fn(() => { throw { errors: [{ message: 'Erro' }] }; }) };
        const middleware = validate(schema);
        const req = { body: {} };
        const res = createRes();
        const next = vi.fn();

        middleware(req, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.payload.error).toEqual([{ message: 'Erro' }]);
        expect(next).not.toHaveBeenCalled();
    });
});
