import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/db.js');
vi.mock('bcryptjs');

import { createRes, createReq, resetControllerMocks } from '../utils/controllerTestUtils.js';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

import {
    getDocuments,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocument
} from '../../controllers/documentController.js';

beforeEach(() => {
    resetControllerMocks(pool, bcrypt);
});

describe('Document Controller', () => {
    it('builds query with filters on getDocuments scoped to brokerId', async () => {
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await getDocuments(createReq({ query: { clientId: 'cli-1', status: 'Apólice', search: 'auto', limit: '5', offset: '2' } }), res);
        expect(querySpy).toHaveBeenCalled();
        expect(res.payload.items).toEqual([]);
        expect(querySpy.mock.calls[0][1]).toContain('bro-test');
        querySpy.mockRestore();
    });

    it('returns 500 when list fails', async () => {
        pool.query.mockRejectedValueOnce(new Error('fail'));
        const res = createRes();
        await getDocuments(createReq(), res);
        expect(res.statusCode).toBe(500);
    });

    it('gets document by id and handles missing', async () => {
        const querySpy = pool.query.mockResolvedValueOnce({ rows: [] });
        const resMissing = createRes();
        await getDocumentById(createReq({ params: { id: 'doc-1' } }), resMissing);
        expect(resMissing.statusCode).toBe(404);

        querySpy.mockResolvedValueOnce({ rows: [{ id: 'doc-1' }] });
        const res = createRes();
        await getDocumentById(createReq({ params: { id: 'doc-1' } }), res);
        expect(res.payload.id).toBe('doc-1');
    });

    it('creates document normalizing optional fields', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 'cli-1' }] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await createDocument(createReq({ body: { clientId: 'cli-1', type: 'Auto', company: 'XYZ', documentNumber: '', startDate: '2025-01-01', endDate: '2025-12-31', status: 'Apólice', attachmentName: '', notes: '' } }), res);
        expect(res.statusCode).toBe(201);
    });

    it('updates and deletes document', async () => {
        const querySpy = pool.query
            .mockResolvedValueOnce({ rows: [{ id: 'doc-1' }] })
            .mockResolvedValueOnce({ rows: [{ id: 'cli-1' }] })
            .mockResolvedValueOnce({ rows: [] });
        const resUpdate = createRes();
        await updateDocument(createReq({ params: { id: 'doc-1' }, body: { clientId: 'cli-1', type: 'Auto', company: 'ABC', documentNumber: '', startDate: '2025-01-01', endDate: '2025-12-31', status: 'Apólice', attachmentName: '', notes: '' } }), resUpdate);
        expect(resUpdate.payload.message).toBe('Documento atualizado');

        querySpy
            .mockResolvedValueOnce({ rows: [{ id: 'doc-1' }] })
            .mockResolvedValueOnce({ rows: [] });
        const resDelete = createRes();
        await deleteDocument(createReq({ params: { id: 'doc-1' } }), resDelete);
        expect(resDelete.payload.message).toBe('Documento excluído');
    });

    it('handles errors on document queries', async () => {
        pool.query.mockRejectedValueOnce(new Error('doc fail'));
        const resById = createRes();
        await getDocumentById(createReq({ params: { id: 'doc-err' } }), resById);
        expect(resById.statusCode).toBe(500);

        pool.query.mockRejectedValueOnce(new Error('create fail'));
        const resCreate = createRes();
        await createDocument(createReq({ body: { clientId: 'cli-1', type: 'Auto', company: 'XYZ', documentNumber: '123', startDate: '2025-01-01', endDate: '2025-12-31', status: 'Apólice' } }), resCreate);
        expect(resCreate.statusCode).toBe(500);

        pool.query.mockRejectedValueOnce(new Error('update fail'));
        const resUpdate = createRes();
        await updateDocument(createReq({ params: { id: 'doc-1' }, body: { clientId: 'cli-1', type: 'Auto', company: 'ABC', documentNumber: '123', startDate: '2025-01-01', endDate: '2025-12-31', status: 'Apólice' } }), resUpdate);
        expect(resUpdate.statusCode).toBe(500);

        pool.query.mockRejectedValueOnce(new Error('delete fail'));
        const resDeleteFail = createRes();
        await deleteDocument(createReq({ params: { id: 'doc-1' } }), resDeleteFail);
        expect(resDeleteFail.statusCode).toBe(500);
    });
});
