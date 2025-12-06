import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { register } from '../controllers/authController.js';
import { validate } from '../middleware/index.js';
import { registerSchema } from '../schemas/index.js';
import { resetTestDb } from './utils/testDbMock.js';

const app = express();
app.use(express.json());
app.post('/register', validate(registerSchema), register);

describe('Auth Controller validation', () => {
    beforeEach(() => {
        resetTestDb();
    });

    it('rejects payload sem campos obrigatórios', async () => {
        const response = await request(app)
            .post('/register')
            .send({ email: 'incompleto@example.com' })
            .expect(400);

        expect(response.body.error).toBeDefined();
    });

    it('cadastra usuário válido', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                name: 'Outro Teste',
                cpf: '97456321558',
                email: 'controller@example.com',
                password: 'Senha123',
            })
            .expect(201);

        expect(response.body.message).toBe('Usuário criado com sucesso');
    });
});
