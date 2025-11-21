import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import pool from '../../src/infrastructure/database/pool.js';
import jwt from 'jsonwebtoken';

describe('Client Person Type Integration Tests', () => {
    let token;
    const testUser = {
        email: 'test_person_type@example.com',
        password: 'password123',
        username: 'TestUser'
    };

    beforeAll(async () => {
        // Create a test user to get a token
        const hashedPass = '$2a$10$X.Y.Z.hashedpassword'; // Mock hash not needed if we mock auth or insert directly
        // Actually, let's just generate a valid token without inserting if auth middleware checks DB, 
        // but usually it just verifies signature. 
        // If authMiddleware checks DB, we need to insert. Let's check authMiddleware.
        // Looking at previous file views, authMiddleware verifies token.

        token = jwt.sign({ id: 'test-user-id', email: testUser.email }, process.env.JWT_SECRET || 'segredo_super_secreto', { expiresIn: '1h' });
    });

    afterAll(async () => {
        await pool.end();
    });

    it('should create a Pessoa Física client successfully', async () => {
        const clientData = {
            id: 'test-pf-' + Date.now(),
            name: 'João Física',
            personType: 'Física',
            cpf: '123.456.789-00',
            email: 'joao@example.com',
            phone: '11999999999',
            birthDate: '1990-01-01',
            maritalStatus: 'Solteiro(a)'
        };

        const res = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send(clientData);

        if (res.status !== 201) {
            console.error('Error creating client:', res.body);
        }
        expect(res.status).toBe(201);
    });

    it('should fail to create Pessoa Física without CPF', async () => {
        const clientData = {
            id: 'test-fail-pf-' + Date.now(),
            name: 'João Sem CPF',
            personType: 'Física',
            // cpf missing
            email: 'joao_nocpf@example.com'
        };

        const res = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send(clientData);

        expect(res.status).toBe(400);
        // Zod error structure usually returns an array of errors or a message
        // Based on previous views, it returns { error: [...] }
        expect(JSON.stringify(res.body)).toContain('CPF é obrigatório');
    });

    it('should create a Pessoa Jurídica client successfully', async () => {
        const clientData = {
            id: 'test-pj-' + Date.now(),
            name: 'Empresa Legal Ltda',
            personType: 'Jurídica',
            cnpj: '12.345.678/0001-90',
            email: 'contato@empresa.com',
            phone: '1133334444'
        };

        const res = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send(clientData);

        expect(res.status).toBe(201);
    });

    it('should fail to create Pessoa Jurídica without CNPJ', async () => {
        const clientData = {
            id: 'test-fail-pj-' + Date.now(),
            name: 'Empresa Sem CNPJ',
            personType: 'Jurídica',
            // cnpj missing
            email: 'fail@empresa.com'
        };

        const res = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send(clientData);

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toContain('CNPJ é obrigatório');
    });

    it('should allow null PF fields for Pessoa Jurídica', async () => {
        // This test confirms we don't need CPF/RG/BirthDate for PJ
        const clientData = {
            id: 'test-pj-min-' + Date.now(),
            name: 'Empresa Minimalista',
            personType: 'Jurídica',
            cnpj: '99.999.999/0001-99',
            email: 'min@empresa.com'
        };

        const res = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send(clientData);

        expect(res.status).toBe(201);
    });
});
