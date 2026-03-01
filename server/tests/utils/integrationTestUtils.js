import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';

export { app };

export const createTestToken = (overrides = {}) => {
    const payload = {
        id: 'test-user-id',
        email: 'test@example.com',
        brokerId: 'bro-test',
        ...overrides,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const postClientWithAuth = (token, clientData) =>
    request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(clientData);

export const registerBrokerRequest = (data) =>
    request(app)
        .post('/api/register-broker')
        .send(data);

export const loginRequest = (email, password) =>
    request(app)
        .post('/api/login')
        .send({ email, password });
