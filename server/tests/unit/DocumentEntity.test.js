import { describe, it, expect } from 'vitest';
import { Document } from '../../src/domain/entities/Document.js';

describe('Document entity', () => {
    it('creates instance from database row with snake_case fields', () => {
        const row = {
            id: 'doc-1',
            clientid: 'cli-1',
            type: 'Auto',
            company: 'Seguradora',
            documentnumber: '12345',
            startdate: '2025-01-01',
            enddate: '2025-12-31',
            status: 'Apólice',
            attachmentname: 'arquivo.pdf',
            notes: 'Observações',
            created_at: '2025-01-01T00:00:00.000Z'
        };

        const doc = Document.fromDatabase(row);
        expect(doc).toBeInstanceOf(Document);
        expect(doc.clientId).toBe('cli-1');
        expect(doc.documentNumber).toBe('12345');
        expect(doc.attachmentName).toBe('arquivo.pdf');
        expect(doc.createdAt).toBe(row.created_at);
    });

    it('serializes to JSON correctly', () => {
        const doc = new Document({
            id: 'doc-2',
            clientId: 'cli-2',
            type: 'Vida',
            company: 'VidaSeg',
            documentNumber: 'VIDA-1',
            startDate: '2025-02-01',
            endDate: '2026-02-01',
            status: 'Proposta',
            attachmentName: null,
            notes: 'Sem anexos',
            createdAt: '2025-02-01T10:00:00.000Z'
        });

        expect(doc.toJSON()).toEqual({
            id: 'doc-2',
            clientId: 'cli-2',
            type: 'Vida',
            company: 'VidaSeg',
            documentNumber: 'VIDA-1',
            startDate: '2025-02-01',
            endDate: '2026-02-01',
            status: 'Proposta',
            attachmentName: null,
            notes: 'Sem anexos',
            createdAt: '2025-02-01T10:00:00.000Z'
        });
    });
});
