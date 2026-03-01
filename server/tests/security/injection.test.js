import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { resetTestDb } from '../utils/testDbMock.js';

describe('SQL Injection Prevention', () => {
    beforeEach(() => resetTestDb());

    const maliciousPayloads = [
        "'; DROP TABLE users; --",
        "1 OR 1=1",
        "admin'--",
        "1; DELETE FROM clients WHERE 1=1",
        "' UNION SELECT * FROM users --",
    ];

    it('rejects malicious input in login email', async () => {
        for (const payload of maliciousPayloads) {
            const response = await request(app)
                .post('/api/login')
                .send({ email: payload, password: 'SenhaForte123' });
            expect([400, 401, 429]).toContain(response.status);
        }
    });

    it('rejects malicious input in client search with valid auth', async () => {
        const agent = request.agent(app);

        await request(app)
            .post('/api/register-broker')
            .send({
                corporateName: 'Test Broker',
                tradeName: 'Test',
                cnpj: '11.222.333/0001-81',
                contactName: 'Admin',
                cpf: '529.982.247-25',
                email: 'injection@test.com',
                password: 'SenhaForte123!',
            })
            .expect(201);

        await agent
            .post('/api/login')
            .send({ email: 'injection@test.com', password: 'SenhaForte123!' })
            .expect(200);

        for (const payload of maliciousPayloads) {
            const response = await agent
                .get(`/api/clients?search=${encodeURIComponent(payload)}`);
            expect(response.status).toBe(200);
            expect(response.body.items).toBeDefined();
        }
    });
});

describe('JWT Security', () => {
    it('rejects requests without token', async () => {
        const response = await request(app).get('/api/clients');
        expect(response.status).toBe(401);
    });

    it('rejects malformed tokens', async () => {
        const response = await request(app)
            .get('/api/clients')
            .set('Authorization', 'Bearer not.a.valid.jwt');
        expect(response.status).toBe(401);
    });

    it('rejects tokens with invalid signature', async () => {
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiYnJva2VySWQiOiJicm8tMSJ9.invalidsignature';
        const response = await request(app)
            .get('/api/clients')
            .set('Authorization', `Bearer ${fakeToken}`);
        expect(response.status).toBe(401);
    });
});
