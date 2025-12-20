import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/app.js';
import { resetTestDb } from '../utils/testDbMock.js';

/**
 * Integration tests for authentication endpoints
 * These tests verify the full authentication flow including database interactions
 */
describe('Auth Integration Tests', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    beforeEach(() => {
        resetTestDb();
    });

    describe('POST /api/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/register')
                .send({
                    name: 'Test User',
                    cpf: '97456321558',
                    email: testEmail,
                    password: testPassword,
                })
                .expect(201);

            expect(response.body.message).toBe('Usuário criado com sucesso');
        });

        it('should reject duplicate email registration', async () => {
            await request(app)
                .post('/api/register')
                .send({
                    name: 'Test User',
                    cpf: '97456321558',
                    email: testEmail,
                    password: testPassword,
                })
                .expect(201);

            await request(app)
                .post('/api/register')
                .send({
                    name: 'Test User',
                    cpf: '97456321558',
                    email: testEmail,
                    password: testPassword,
                })
                .expect(400);
        });
    });

    describe('POST /api/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/register')
                .send({
                    name: 'Test User',
                    cpf: '97456321558',
                    email: testEmail,
                    password: testPassword,
                });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    email: testEmail,
                    password: testPassword,
                })
                .expect(200);

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
                .expect(400);
        });

        it('should reject non-existent user', async () => {
            await request(app)
                .post('/api/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testPassword,
                })
                .expect(400);
        });
    });
});
