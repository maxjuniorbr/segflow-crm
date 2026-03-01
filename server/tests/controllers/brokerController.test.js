import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/db.js');
vi.mock('bcryptjs');

import { createRes, createReq, resetControllerMocks } from '../utils/controllerTestUtils.js';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { buildBrokerRow } from '../utils/testFactories.js';

import {
    getBrokers,
    getBrokerById,
    createBroker,
    updateBroker,
    deleteBroker
} from '../../controllers/brokerController.js';

beforeEach(() => {
    resetControllerMocks(pool, bcrypt);
});

describe('Broker Controller', () => {
    it('lists brokers ordered', async () => {
        const sampleBrokerRow = buildBrokerRow();
        const querySpy = pool.query.mockResolvedValueOnce({ rows: [sampleBrokerRow] });
        const res = createRes();
        await getBrokers(createReq(), res);
        expect(res.payload[0].tradeName).toBe(sampleBrokerRow.trade_name);
        expect(querySpy).toHaveBeenCalled();
    });

    it('handles list error', async () => {
        pool.query.mockRejectedValueOnce(new Error('fail'));
        const res = createRes();
        await getBrokers(createReq(), res);
        expect(res.statusCode).toBe(500);
    });

    it('gets broker by id', async () => {
        const sampleBrokerRow = buildBrokerRow();
        pool.query.mockResolvedValueOnce({ rows: [] });
        const resMissing = createRes();
        await getBrokerById(createReq({ params: { id: 'missing' }, user: { id: 1, brokerId: 'missing' } }), resMissing);
        expect(resMissing.statusCode).toBe(404);

        pool.query.mockResolvedValueOnce({ rows: [sampleBrokerRow] });
        const res = createRes();
        await getBrokerById(createReq({ params: { id: 'bro-1' }, user: { id: 1, brokerId: 'bro-1' } }), res);
        expect(res.payload.id).toBe('bro-1');
    });

    it('creates broker enforcing unique fields', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await createBroker(createReq({ body: { corporateName: 'Razão', tradeName: 'Fantasia', cnpj: '12.345.678/0001-90', susepCode: '123', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' } }), res);
        expect(res.statusCode).toBe(201);

        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 'ex' }] });
        const dupRes = createRes();
        await createBroker(createReq({ body: { corporateName: 'Razão', tradeName: 'Fantasia', cnpj: '12.345.678/0001-90', susepCode: '', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' } }), dupRes);
        expect(dupRes.statusCode).toBe(400);

        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 'ex' }] });
        const dupSusepRes = createRes();
        await createBroker(createReq({ body: { corporateName: 'Razão', tradeName: 'Fantasia', cnpj: '98.765.432/0001-10', susepCode: '123', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' } }), dupSusepRes);
        expect(dupSusepRes.statusCode).toBe(400);
    });

    it('updates broker with unique validation', async () => {
        const sampleBrokerRow = buildBrokerRow();
        pool.query
            .mockResolvedValueOnce({ rows: [sampleBrokerRow] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await updateBroker(createReq({ params: { id: 'bro-1' }, body: { corporateName: 'Nova', tradeName: 'Fantasia', cnpj: '12.345.678/0001-90', susepCode: '', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' }, user: { id: 1, brokerId: 'bro-1' } }), res);
        expect(res.statusCode).toBe(200);

        pool.query.mockReset();

        pool.query
            .mockResolvedValueOnce({ rows: [sampleBrokerRow] })
            .mockResolvedValueOnce({ rows: [{ id: 'other' }] });
        const dupRes = createRes();
        await updateBroker(createReq({ params: { id: 'bro-1' }, body: { corporateName: 'Nova', tradeName: 'Fantasia', cnpj: '12.345.678/0001-90', susepCode: '', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' }, user: { id: 1, brokerId: 'bro-1' } }), dupRes);
        expect(dupRes.statusCode).toBe(400);
    });

    it('rejects broker update when susep already exists', async () => {
        const sampleBrokerRow = buildBrokerRow();
        pool.query
            .mockResolvedValueOnce({ rows: [sampleBrokerRow] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 'other' }] });
        const res = createRes();
        await updateBroker(createReq({ params: { id: 'bro-1' }, body: { corporateName: 'Nova', tradeName: 'Fantasia', cnpj: '12.345.678/0001-90', susepCode: '123', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' }, user: { id: 1, brokerId: 'bro-1' } }), res);
        expect(res.statusCode).toBe(400);
        expect(res.payload.error[0].path).toContain('susepCode');
    });

    it('deletes broker', async () => {
        const sampleBrokerRow = buildBrokerRow();
        pool.query
            .mockResolvedValueOnce({ rows: [sampleBrokerRow] })
            .mockResolvedValueOnce({ rows: [{ count: 0 }] })
            .mockResolvedValueOnce({ rows: [{ count: 0 }] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await deleteBroker(createReq({ params: { id: 'bro-1' }, user: { id: 1, brokerId: 'bro-1' } }), res);
        expect(res.payload.message).toBe('Corretora excluída');

        pool.query
            .mockResolvedValueOnce({ rows: [sampleBrokerRow] })
            .mockResolvedValueOnce({ rows: [{ count: 0 }] })
            .mockResolvedValueOnce({ rows: [{ count: 0 }] })
            .mockRejectedValueOnce(new Error('fail'));
        const resFail = createRes();
        await deleteBroker(createReq({ params: { id: 'bro-1' }, user: { id: 1, brokerId: 'bro-1' } }), resFail);
        expect(resFail.statusCode).toBe(500);
    });

    it('blocks broker deletion when dependents exist', async () => {
        const sampleBrokerRow = buildBrokerRow();
        pool.query
            .mockResolvedValueOnce({ rows: [sampleBrokerRow] })
            .mockResolvedValueOnce({ rows: [{ count: 2 }] })
            .mockResolvedValueOnce({ rows: [{ count: 0 }] });
        const res = createRes();
        await deleteBroker(createReq({ params: { id: 'bro-1' }, user: { id: 1, brokerId: 'bro-1' } }), res);
        expect(res.statusCode).toBe(400);
        expect(res.payload.error).toMatch(/usuários ou clientes/i);
    });

    it('handles broker controller errors', async () => {
        const sampleBrokerRow = buildBrokerRow();
        pool.query.mockRejectedValueOnce(new Error('get fail'));
        const resGet = createRes();
        await getBrokerById(createReq({ params: { id: 'bro-1' }, user: { id: 1, brokerId: 'bro-1' } }), resGet);
        expect(resGet.statusCode).toBe(500);

        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockRejectedValueOnce(new Error('create fail'));
        const resCreate = createRes();
        await createBroker(createReq({ body: { corporateName: 'Nova', tradeName: 'Fantasia', cnpj: '12.345.678/0001-90', susepCode: '123', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' } }), resCreate);
        expect(resCreate.statusCode).toBe(500);

        pool.query
            .mockResolvedValueOnce({ rows: [sampleBrokerRow] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockRejectedValueOnce(new Error('update fail'));
        const resUpdate = createRes();
        await updateBroker(createReq({ params: { id: 'bro-1' }, body: { corporateName: 'Nova', tradeName: 'Fantasia', cnpj: '12.345.678/0001-90', susepCode: '123', contactName: 'Contato', email: 'email@example.com', phone: '11', mobile: '11' }, user: { id: 1, brokerId: 'bro-1' } }), resUpdate);
        expect(resUpdate.statusCode).toBe(500);
    });
});
