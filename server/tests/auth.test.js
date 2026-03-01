import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerBroker } from '../controllers/authController.js';
import { validate } from '../middleware/index.js';
import { registerBrokerSchema } from '../schemas/index.js';
import { resetTestDb } from './utils/testDbMock.js';

const app = express();
app.use(express.json());
app.post('/register-broker', validate(registerBrokerSchema), registerBroker);

describe('Auth Controller validation', () => {
    beforeEach(() => {
        resetTestDb();
    });

    it('rejects payload sem campos obrigatórios', async () => {
        const response = await request(app)
            .post('/register-broker')
            .send({ email: 'incompleto@example.com' })
            .expect(400);

        expect(response.body.error).toBeDefined();
    });

    it('cadastra corretora com usuário admin válido', async () => {
        const response = await request(app)
            .post('/register-broker')
            .send({
                corporateName: 'Corretora Teste LTDA',
                tradeName: 'Corretora Teste',
                cnpj: '11.222.333/0001-81',
                susepCode: '10.000001',
                phone: '(11) 99999-0000',
                mobile: '(11) 99999-0001',
                email: 'controller@example.com',
                contactName: 'Usuario Teste',
                cpf: '529.982.247-25',
                password: 'SenhaForte123',
            })
            .expect(201);

        expect(response.body.message).toBe('Corretora cadastrada com sucesso');
    });
});
