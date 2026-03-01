import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { resetTestDb } from '../utils/testDbMock.js';

describe('Cross-Tenant Isolation', () => {
    beforeEach(() => resetTestDb());

    it('prevents registration with duplicate CNPJ across brokers', async () => {
        const brokerData = {
            corporateName: 'Broker A',
            tradeName: 'A',
            cnpj: '11.222.333/0001-81',
            contactName: 'Admin A',
            cpf: '529.982.247-25',
            email: 'a@test.com',
            password: 'SenhaForte123',
        };

        const res1 = await request(app)
            .post('/api/register-broker')
            .send(brokerData)
            .expect(201);

        expect(res1.body.message).toBe('Corretora cadastrada com sucesso');

        const res2 = await request(app)
            .post('/api/register-broker')
            .send({
                ...brokerData,
                email: 'b@test.com',
                cpf: '390.533.447-05',
            });
        expect(res2.status).toBe(400);
    });

    it('isolates data by broker via login flow', async () => {
        await request(app)
            .post('/api/register-broker')
            .send({
                corporateName: 'Broker Alpha',
                tradeName: 'Alpha',
                cnpj: '11.222.333/0001-81',
                contactName: 'Admin Alpha',
                cpf: '529.982.247-25',
                email: 'alpha@test.com',
                password: 'SenhaForte123',
            })
            .expect(201);

        const loginRes = await request(app)
            .post('/api/login')
            .send({ email: 'alpha@test.com', password: 'SenhaForte123' });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.user).toBeDefined();
        expect(loginRes.body.user.isAuthenticated).toBe(true);
    });

    it('prevents cross-tenant access to clients', async () => {
        const agentA = request.agent(app);
        const agentB = request.agent(app);

        await request(app)
            .post('/api/register-broker')
            .send({
                corporateName: 'Broker A',
                tradeName: 'A',
                cnpj: '11.222.333/0001-81',
                contactName: 'Admin A',
                cpf: '529.982.247-25',
                email: 'brokerA@test.com',
                password: 'SenhaForte123!',
            })
            .expect(201);

        await request(app)
            .post('/api/register-broker')
            .send({
                corporateName: 'Broker B',
                tradeName: 'B',
                cnpj: '33.000.167/0001-01',
                contactName: 'Admin B',
                cpf: '123.456.789-09',
                email: 'brokerB@test.com',
                password: 'SenhaForte123!',
            })
            .expect(201);

        const loginA = await agentA
            .post('/api/login')
            .send({ email: 'brokerA@test.com', password: 'SenhaForte123!' });
        expect(loginA.status).toBe(200);

        const createRes = await agentA
            .post('/api/clients')
            .send({
                name: 'Client of A',
                personType: 'Física',
                cpf: '529.982.247-25',
                email: 'clientA@test.com',
                phone: '(11) 99999-0000',
            });
        expect(createRes.status).toBe(201);

        const loginB = await agentB
            .post('/api/login')
            .send({ email: 'brokerB@test.com', password: 'SenhaForte123!' });
        expect(loginB.status).toBe(200);

        const listRes = await agentB.get('/api/clients');
        expect(listRes.status).toBe(200);
        expect(listRes.body.items).toHaveLength(0);
    });

    it('prevents cross-tenant access to users', async () => {
        const agentX = request.agent(app);
        const agentY = request.agent(app);

        await request(app)
            .post('/api/register-broker')
            .send({
                corporateName: 'Broker X',
                tradeName: 'X',
                cnpj: '11.222.333/0001-81',
                contactName: 'Admin X',
                cpf: '529.982.247-25',
                email: 'brokerX@test.com',
                password: 'SenhaForte123!',
            })
            .expect(201);

        await request(app)
            .post('/api/register-broker')
            .send({
                corporateName: 'Broker Y',
                tradeName: 'Y',
                cnpj: '33.000.167/0001-01',
                contactName: 'Admin Y',
                cpf: '123.456.789-09',
                email: 'brokerY@test.com',
                password: 'SenhaForte123!',
            })
            .expect(201);

        const loginX = await agentX
            .post('/api/login')
            .send({ email: 'brokerX@test.com', password: 'SenhaForte123!' });
        expect(loginX.status).toBe(200);

        const loginY = await agentY
            .post('/api/login')
            .send({ email: 'brokerY@test.com', password: 'SenhaForte123!' });
        expect(loginY.status).toBe(200);

        const usersFromX = await agentX.get('/api/users');
        expect(usersFromX.status).toBe(200);

        const usersFromY = await agentY.get('/api/users');
        expect(usersFromY.status).toBe(200);

        const xEmails = usersFromX.body.map(u => u.email);
        const yEmails = usersFromY.body.map(u => u.email);
        expect(xEmails).not.toContain('brokerY@test.com');
        expect(yEmails).not.toContain('brokerX@test.com');
    });
});
