import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/db.js', () => {
    const queryFn = vi.fn();
    return {
        default: {
            query: queryFn,
            connect: vi.fn().mockResolvedValue({
                query: queryFn,
                release: vi.fn(),
            })
        }
    };
});

vi.mock('bcryptjs', () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn()
    }
}));

import { createRes, createReq } from '../utils/controllerTestUtils.js';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { buildClientRow } from '../utils/testFactories.js';

import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
} from '../../controllers/clientController.js';

beforeEach(() => {
    vi.clearAllMocks();
    pool.query.mockReset();
    bcrypt.genSalt.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
});

describe('Client Controller', () => {
    it('returns clients list scoped to brokerId', async () => {
        const sampleClientRow = buildClientRow();
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [{ ...sampleClientRow, total_count: 1 }] });
        const res = createRes();
        await getClients(createReq(), res);
        expect(res.payload.items[0].name).toBe('João');
        expect(querySpy).toHaveBeenCalled();
        expect(querySpy.mock.calls[0][1]).toContain('bro-test');
    });

    it('handles database errors in getClients', async () => {
        const querySpy = pool.query.mockRejectedValueOnce(new Error('db error'));
        const res = createRes();
        await getClients(createReq(), res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('db error');
        expect(querySpy).toHaveBeenCalled();
    });

    it('returns 404 when client missing', async () => {
        const querySpy = pool.query.mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await getClientById(createReq({ params: { id: 'missing' } }), res);
        expect(res.statusCode).toBe(404);
        expect(querySpy).toHaveBeenCalled();
    });

    it('handles errors when fetching single client', async () => {
        pool.query.mockRejectedValueOnce(new Error('boom'));
        const res = createRes();
        await getClientById(createReq({ params: { id: 'cli-1' } }), res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('boom');
    });

    it('creates client with unique identifiers', async () => {
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createRes();
        await createClient(createReq({ body: { name: 'Novo', cpf: '123', cnpj: '', personType: 'Física' } }), res);
        expect(res.statusCode).toBe(201);
        expect(querySpy).toHaveBeenCalledTimes(2);
    });

    it('rejects duplicated CPF on create', async () => {
        const querySpy = pool.query.mockResolvedValueOnce({ rows: [{ id: 'dup' }] });
        const res = createRes();
        await createClient(createReq({ body: { name: 'Dup', cpf: '123', personType: 'Física' } }), res);
        expect(res.statusCode).toBe(400);
        expect(res.payload.error[0].message).toContain('CPF já cadastrado');
        expect(querySpy).toHaveBeenCalled();
    });

    it('returns 500 when create client fails', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockRejectedValueOnce(new Error('insert fail'));
        const res = createRes();
        await createClient(createReq({ body: { name: 'Novo', cpf: '123', personType: 'Física' } }), res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('insert fail');
    });

    it('updates client and validates duplicates', async () => {
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [{ id: 'cli-1' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createRes();
        await updateClient(createReq({ params: { id: 'cli-1' }, body: { name: 'Atualizado', cpf: '123' } }), res);
        expect(res.statusCode).toBe(200);
        expect(res.payload.message).toContain('atualizado');
    });

    it('returns 500 when update client fails', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 'cli-1' }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockRejectedValueOnce(new Error('update fail'));
        const res = createRes();
        await updateClient(createReq({ params: { id: 'cli-1' }, body: { name: 'Atualizado', cpf: '123' } }), res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('update fail');
    });

    it('prevents client deletion with active proposals', async () => {
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [{ id: 'cli-1' }] })
            .mockResolvedValueOnce({ rows: [{ count: 2 }] });
        const res = createRes();
        await deleteClient(createReq({ params: { id: 'cli-1' } }), res);
        expect(res.statusCode).toBe(400);
    });

    it('deletes client when no proposals', async () => {
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [{ id: 'cli-1' }] })
            .mockResolvedValueOnce({ rows: [{ count: 0 }] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await deleteClient(createReq({ params: { id: 'cli-1' } }), res);
        expect(res.statusCode).toBe(200);
        expect(res.payload.message).toBe('Cliente excluído');
    });

    it('returns 500 when delete client fails', async () => {
        pool.query.mockRejectedValueOnce(new Error('delete fail'));
        const res = createRes();
        await deleteClient(createReq({ params: { id: 'cli-1' } }), res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('delete fail');
    });
});
