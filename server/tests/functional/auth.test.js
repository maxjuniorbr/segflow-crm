import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/app.js';
import { resetTestDb } from '../utils/testDbMock.js';

/**
 * Integration tests for authentication endpoints
 * Tests the broker registration flow and login
 */
describe('Auth Integration Tests', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';
    // CPF válido para testes (dígitos verificadores corretos)
    const testCpf = '529.982.247-25';

    const brokerPayload = {
        corporateName: 'Test Corretora LTDA',
        tradeName: 'Test Corretora',
        // CNPJ válido para testes (dígitos verificadores corretos)
        cnpj: '11.222.333/0001-81',
        susepCode: '10.000001',
        phone: '(11) 99999-0000',
        mobile: '(11) 99999-0001',
        email: testEmail,
        contactName: 'Test User',
        cpf: testCpf,
        password: testPassword
    };

    beforeEach(() => {
        resetTestDb();
    });

    describe('POST /api/register-broker', () => {
        it('should register a new broker with admin user successfully', async () => {
            const response = await request(app)
                .post('/api/register-broker')
                .send(brokerPayload);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Corretora cadastrada com sucesso');
        });

        it('should reject duplicate email registration', async () => {
            await request(app)
                .post('/api/register-broker')
                .send(brokerPayload)
                .expect(201);

            const duplicatePayload = {
                ...brokerPayload,
                // CNPJ e CPF diferentes, mas válidos
                cnpj: '33.000.167/0001-01',
                cpf: '123.456.789-09'
                // Same email - should fail
            };

            const response = await request(app)
                .post('/api/register-broker')
                .send(duplicatePayload)
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject duplicate CNPJ registration', async () => {
            await request(app)
                .post('/api/register-broker')
                .send(brokerPayload)
                .expect(201);

            const duplicatePayload = {
                ...brokerPayload,
                email: 'other@example.com',
                // CPF diferente mas válido
                cpf: '123.456.789-09'
                // Same CNPJ - should fail
            };

            const response = await request(app)
                .post('/api/register-broker')
                .send(duplicatePayload)
                .expect(400);

            expect(response.body.error).toBeDefined();
        });
    });

    describe('POST /api/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/register-broker')
                .send(brokerPayload);
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: testEmail,
                    password: testPassword,
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(testEmail);
            expect(response.body.user.isAuthenticated).toBe(true);
            expect(response.headers['set-cookie']).toBeDefined();
        });

        it('should reject invalid credentials', async () => {
            await request(app)
                .post('/api/login')
                .send({
                    email: testEmail,
                    password: 'wrongpassword',
                })
                .expect(401);
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testPassword,
                });
            expect([401, 429]).toContain(response.status);
        });
    });
});
