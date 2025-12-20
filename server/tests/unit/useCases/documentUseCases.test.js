import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('crypto', () => ({
    randomUUID: vi.fn(() => 'doc-123')
}));

vi.mock('../../../src/infrastructure/repositories/documentRepository.js', () => ({
    listDocuments: vi.fn(),
    findDocumentById: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn()
}));

import {
    listDocuments,
    getDocumentByIdUseCase,
    createDocumentUseCase,
    updateDocumentUseCase,
    deleteDocumentUseCase
} from '../../../src/application/useCases/documentUseCases.js';
import {
    listDocuments as listDocumentsRepo,
    findDocumentById,
    createDocument as createDocumentRepo,
    updateDocument as updateDocumentRepo,
    deleteDocument as deleteDocumentRepo
} from '../../../src/infrastructure/repositories/documentRepository.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('document use cases', () => {
    it('lists documents', async () => {
        listDocumentsRepo.mockResolvedValueOnce([{ id: 'doc-1', status: 'Apólice' }]);

        const result = await listDocuments({ status: 'Apólice' });

        expect(result.status).toBe(200);
        expect(result.payload).toEqual([{ id: 'doc-1', status: 'Apólice' }]);
    });

    it('returns 404 when document missing', async () => {
        findDocumentById.mockResolvedValueOnce(null);

        const result = await getDocumentByIdUseCase('missing');

        expect(result.status).toBe(404);
        expect(result.payload.error).toContain('Documento não encontrado');
    });

    it('creates document normalizing optional fields', async () => {
        const result = await createDocumentUseCase({
            clientId: 'cli-1',
            type: 'Auto',
            company: 'Seguradora',
            documentNumber: '',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'Proposta',
            attachmentName: '',
            notes: ''
        });

        expect(result.status).toBe(201);
        expect(createDocumentRepo).toHaveBeenCalledWith({
            id: 'doc-123',
            clientId: 'cli-1',
            type: 'Auto',
            company: 'Seguradora',
            documentNumber: null,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'Proposta',
            attachmentName: null,
            notes: null
        });
    });

    it('updates document with normalized fields', async () => {
        const result = await updateDocumentUseCase('doc-1', {
            clientId: 'cli-1',
            type: 'Auto',
            company: 'Seguradora',
            documentNumber: '',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'Proposta',
            attachmentName: '',
            notes: ''
        });

        expect(result.status).toBe(200);
        expect(updateDocumentRepo).toHaveBeenCalledWith({
            id: 'doc-1',
            clientId: 'cli-1',
            type: 'Auto',
            company: 'Seguradora',
            documentNumber: null,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'Proposta',
            attachmentName: null,
            notes: null
        });
    });

    it('deletes document', async () => {
        const result = await deleteDocumentUseCase('doc-1');

        expect(result.status).toBe(200);
        expect(deleteDocumentRepo).toHaveBeenCalledWith('doc-1');
    });
});
