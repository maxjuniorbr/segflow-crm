import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../config/db.js', () => ({
    default: {
        query: vi.fn()
    }
}));

import pool from '../../../config/db.js';
import {
    listDocuments,
    findDocumentById,
    createDocument,
    updateDocument,
    deleteDocument
} from '../../../src/infrastructure/repositories/documentRepository.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('document repository', () => {
    it('lists documents with filters', async () => {
        const mockRows = [{ id: 'doc-1', total_count: 1 }];
        pool.query
            .mockResolvedValueOnce({ rows: mockRows });

        const result = await listDocuments({
            brokerId: 'broker-1',
            clientId: 'cli-1',
            status: 'Proposta',
            search: 'Auto',
            limit: 10,
            offset: 0
        });

        expect(result).toEqual({ rows: mockRows, total: 1 });
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE'), expect.arrayContaining(['broker-1', 'cli-1', 'Proposta', '%auto%']));
    });

    it('finds document by id', async () => {
        const mockRow = { id: 'doc-1' };
        pool.query.mockResolvedValueOnce({ rows: [mockRow] });

        const result = await findDocumentById('doc-1', 'broker-1');

        expect(result).toEqual(mockRow);
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), ['doc-1', 'broker-1']);
    });

    it('creates document with broker isolation', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        const rowCount = await createDocument({
            id: 'doc-1',
            clientId: 'cli-1',
            brokerId: 'broker-1',
            type: 'Auto',
            company: 'Seg',
            documentNumber: '123',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'Ativo',
            attachmentName: 'file.pdf',
            notes: 'Nota'
        });

        expect(rowCount).toBe(1);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT'),
            ['doc-1', 'cli-1', 'broker-1', 'Auto', 'Seg', '123', '2024-01-01', '2024-12-31', 'Ativo', 'file.pdf', 'Nota']
        );
    });

    it('updates document', async () => {
        pool.query.mockResolvedValueOnce({});

        await updateDocument({
            id: 'doc-1',
            brokerId: 'broker-1',
            clientId: 'cli-2',
            type: 'Vida',
            company: 'Seg2',
            documentNumber: '456',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'Renovado',
            attachmentName: 'new.pdf',
            notes: 'Nota2'
        });

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE'),
            ['cli-2', 'Vida', 'Seg2', '456', '2025-01-01', '2025-12-31', 'Renovado', 'new.pdf', 'Nota2', 'doc-1', 'broker-1']
        );
    });

    it('deletes document', async () => {
        pool.query.mockResolvedValueOnce({});

        await deleteDocument('doc-1', 'broker-1');

        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE'), ['doc-1', 'broker-1']);
    });
});
