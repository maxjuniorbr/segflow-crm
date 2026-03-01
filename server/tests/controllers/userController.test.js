import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/db.js');
vi.mock('bcryptjs');

import { createRes, createReq, resetControllerMocks } from '../utils/controllerTestUtils.js';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
import { buildUserRow } from '../utils/testFactories.js';

import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../../controllers/userController.js';

beforeEach(() => {
    resetControllerMocks(pool, bcrypt);
});

describe('User Controller', () => {
    it('returns user list scoped to brokerId without password', async () => {
        const sampleUserRow = buildUserRow();
        const querySpy = pool.query.mockResolvedValueOnce({ rows: [sampleUserRow] });
        const res = createRes();
        await getUsers(createReq(), res);
        expect(res.payload[0].password).toBeUndefined();
        expect(querySpy.mock.calls[0][1]).toContain('bro-test');
    });

    it('handles errors when listing users', async () => {
        pool.query.mockRejectedValueOnce(new Error('fail'));
        const res = createRes();
        await getUsers(createReq(), res);
        expect(res.statusCode).toBe(500);
    });

    it('getUserById handles missing', async () => {
        const querySpy = pool.query.mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await getUserById(createReq({ params: { id: 1 } }), res);
        expect(res.statusCode).toBe(404);
        querySpy.mockRestore();
    });

    it('handles errors when fetching user by id', async () => {
        pool.query.mockRejectedValueOnce(new Error('user fail'));
        const res = createRes();
        await getUserById(createReq({ params: { id: 1 } }), res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('user fail');
    });

    it('getUserById returns data when found', async () => {
        const sampleUserRow = buildUserRow();
        pool.query.mockResolvedValueOnce({ rows: [sampleUserRow] });
        const res = createRes();
        await getUserById(createReq({ params: { id: 1 } }), res);
        expect(res.payload.id).toBe(sampleUserRow.id);
    });

    it('updates user profile data', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [buildUserRow()] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createRes();
        await updateUser(createReq({ params: { id: 1 }, body: { name: 'Novo', cpf: '11122233344', email: 'novo@example.com' } }), res);
        expect(res.payload.message).toContain('Usuário atualizado');
    });

    it('returns 404 when updating non-existent user', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await updateUser(createReq({ params: { id: 999 }, body: { name: 'Novo', cpf: '11122233344', email: 'novo@example.com' } }), res);
        expect(res.statusCode).toBe(404);
    });

    it('rejects duplicate email on update', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [buildUserRow()] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 2 }] });
        const res = createRes();
        await updateUser(createReq({ params: { id: 1 }, body: { name: 'Novo', cpf: '11122233344', email: 'dup@example.com' } }), res);
        expect(res.statusCode).toBe(400);
    });

    it('rejects duplicate CPF on update', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [buildUserRow()] })
            .mockResolvedValueOnce({ rows: [{ id: 2 }] });
        const res = createRes();
        await updateUser(createReq({ params: { id: 1 }, body: { name: 'Novo', cpf: '111.222.333-44', email: 'novo@example.com' } }), res);
        expect(res.statusCode).toBe(400);
    });

    it('returns 500 when update user fails', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [buildUserRow()] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockRejectedValueOnce(new Error('update fail'));
        const res = createRes();
        await updateUser(createReq({ params: { id: 1 }, body: { name: 'Novo', cpf: '111.222.333-44', email: 'novo@example.com' } }), res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('update fail');
    });

    it('deletes user', async () => {
        const sampleUserRow = buildUserRow();
        pool.query
            .mockResolvedValueOnce({ rows: [sampleUserRow] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await deleteUser(createReq({ params: { id: 99 } }), res);
        expect(res.payload.message).toBe('Usuário excluído');
    });

    it('prevents self-deletion', async () => {
        const res = createRes();
        await deleteUser(createReq({ params: { id: 1 }, user: { id: 1, brokerId: 'bro-test' } }), res);
        expect(res.statusCode).toBe(403);
        expect(res.payload.error).toContain('própria conta');
    });

    it('prevents self-deletion with string id match', async () => {
        const res = createRes();
        await deleteUser(createReq({ params: { id: '1' }, user: { id: 1, brokerId: 'bro-test' } }), res);
        expect(res.statusCode).toBe(403);
    });

    it('returns 500 when delete fails', async () => {
        pool.query.mockRejectedValueOnce(new Error('db error'));
        const res = createRes();
        await deleteUser(createReq({ params: { id: 99 } }), res);
        expect(res.statusCode).toBe(500);
    });
});
