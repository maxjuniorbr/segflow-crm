import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { register, login } from '../controllers/authController.js';
import pool from '../config/db.js';

// Mock database query
// Actually, for integration test we might want to use a test DB or mock the pool.
// Since we don't have a test DB setup easily here, let's mock the pool.
// But mocking ES modules is tricky.
// Let's create a simple unit test for the controller logic if possible, or mock the pool.

// For simplicity and robustness without setting up a full test DB environment in this environment:
// I will mock the pool.query method.

import { vi } from 'vitest';

vi.mock('../config/db.js', () => ({
    default: {
        query: vi.fn()
    }
}));

const app = express();
app.use(express.json());
app.post('/register', register);
app.post('/login', login);

describe('Auth Controller', () => {
    it('should register a new user', async () => {
        // Mock successful registration
        pool.query.mockResolvedValueOnce({ rows: [] }); // Check email
        pool.query.mockResolvedValueOnce({ rows: [] }); // Insert

        const res = await request(app)
            .post('/register')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Usuário criado com sucesso');
    });

    it('should fail if email already exists', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Email exists

        const res = await request(app)
            .post('/register')
            .send({
                email: 'existing@example.com',
                password: 'password123'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email já cadastrado');
    });
});
