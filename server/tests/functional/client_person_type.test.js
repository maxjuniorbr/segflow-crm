import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { resetTestDb } from '../utils/testDbMock.js';
import { createTestToken, postClientWithAuth } from '../utils/integrationTestUtils.js';
import { buildTestAddress } from '../utils/testFactories.js';

describe('Client Person Type Integration Tests', () => {
    let token;

    beforeAll(async () => {
        token = createTestToken({ email: 'test_person_type@example.com' });
    });

    beforeEach(() => {
        resetTestDb();
    });

    it('should create a Pessoa Física client successfully', async () => {
        const res = await postClientWithAuth(token, {
            id: 'test-pf-' + Date.now(),
            name: 'João Física',
            personType: 'Física',
            cpf: '529.982.247-25',
            email: 'joao@example.com',
            phone: '11999999999',
            birthDate: '1990-01-01',
            maritalStatus: 'Solteiro(a)'
        });

        if (res.status !== 201) {
            console.error('Error creating client:', res.body);
        }
        expect(res.status).toBe(201);
    });

    it('should fail to create Pessoa Física without CPF', async () => {
        const res = await postClientWithAuth(token, {
            id: 'test-fail-pf-' + Date.now(),
            name: 'João Sem CPF',
            personType: 'Física',
            email: 'joao_nocpf@example.com',
            phone: '11999999999',
            address: buildTestAddress()
        });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toContain('CPF é obrigatório');
    });

    it('should create a Pessoa Jurídica client successfully', async () => {
        const res = await postClientWithAuth(token, {
            id: 'test-pj-' + Date.now(),
            name: 'Empresa Legal Ltda',
            personType: 'Jurídica',
            cnpj: '11.222.333/0001-81',
            email: 'contato@empresa.com',
            phone: '1133334444',
            address: buildTestAddress({ street: 'Av Teste', number: '456' })
        });

        expect(res.status).toBe(201);
    });

    it('should fail to create Pessoa Jurídica without CNPJ', async () => {
        const res = await postClientWithAuth(token, {
            id: 'test-fail-pj-' + Date.now(),
            name: 'Empresa Sem CNPJ',
            personType: 'Jurídica',
            email: 'fail@empresa.com',
            phone: '1133334444',
            address: buildTestAddress({ street: 'Rua Fail', number: '999', neighborhood: 'Fail' })
        });

        expect(res.status).toBe(400);
        expect(JSON.stringify(res.body)).toContain('CNPJ é obrigatório');
    });

    it('should allow null PF fields for Pessoa Jurídica', async () => {
        const res = await postClientWithAuth(token, {
            id: 'test-pj-min-' + Date.now(),
            name: 'Empresa Minimalista',
            personType: 'Jurídica',
            cnpj: '06.990.590/0001-23',
            email: 'semcnpj@empresa.com',
            phone: '1133334444',
            address: buildTestAddress({ street: 'Rua Empresa', number: '789', neighborhood: 'Comercial' })
        });

        expect(res.status).toBe(201);
    });
});
