import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../config/db.js', () => ({
    default: {
        query: vi.fn()
    }
}));

import pool from '../../../config/db.js';
import {
    listDocuments,
    findDocumentById
} from '../../../src/infrastructure/repositories/documentRepository.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('document repository', () => {
    it('builds query with filters and pagination', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await listDocuments({
            clientId: 'cli-1',
            status: 'Apólice',
            search: 'ABC',
            limit: '10',
            offset: '20'
        });

        const [query, values] = pool.query.mock.calls[0];
        expect(query).toContain('FROM documents d');
        expect(query).toContain('WHERE');
        expect(query).toContain('LOWER(d.documentnumber)');
        expect(query).toContain('LIMIT');
        expect(query).toContain('OFFSET');
        expect(values).toEqual(['cli-1', 'Apólice', '%abc%', 10, 20]);
    });

    it('builds query without filters', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await listDocuments({});

        const [query, values] = pool.query.mock.calls[0];
        expect(query).toContain('FROM documents d');
        expect(query).not.toContain('WHERE');
        expect(values).toEqual([]);
    });

    it('finds document by id with proper params', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 'doc-1' }] });

        const result = await findDocumentById('doc-1');

        expect(result.id).toBe('doc-1');
        expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['doc-1']);
    });
});
