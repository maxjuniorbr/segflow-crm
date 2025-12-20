import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import jwt from 'jsonwebtoken';
import { resetTestDb } from '../utils/testDbMock.js';

describe('Client Person Type Integration Tests', () => {
    let token;
    const testUser = {
        email: 'test_person_type@example.com',
        password: 'password123',
        username: 'TestUser'
    };

    beforeAll(async () => {
        token = jwt.sign({ id: 'test-user-id', email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });    // Clean up test clients before each test to avoid uniqueness conflicts
    beforeEach(() => {
        resetTestDb();
    });

    it('should create a Pessoa Física client successfully', async () => {
        const clientData = {
            id: 'test-pf-' + Date.now(),
            name: 'João Física',
            personType: 'Física',
            cpf: '529.982.247-25', // Valid CPF for testing
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
            email: 'joao_nocpf@example.com',
            phone: '11999999999',
            address: {
                street: 'Rua Teste',
                number: '123',
                neighborhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-100'
            }
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
            cnpj: '11.222.333/0001-81', // Valid CNPJ for testing
            email: 'contato@empresa.com',
            phone: '1133334444',
            address: {
                street: 'Av Teste',
                number: '456',
                neighborhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-100'
            }
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
            email: 'fail@empresa.com',
            phone: '1133334444',
            address: {
                street: 'Rua Fail',
                number: '999',
                neighborhood: 'Fail',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-100'
            }
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
            cnpj: '06.990.590/0001-23', // Valid CNPJ for testing
            email: 'semcnpj@empresa.com',
            phone: '1133334444',
            address: {
                street: 'Rua Empresa',
                number: '789',
                neighborhood: 'Comercial',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-100'
            }
        };

        const res = await request(app)
            .post('/api/clients')
            .set('Authorization', `Bearer ${token}`)
            .send(clientData);

        expect(res.status).toBe(201);
    });
});
