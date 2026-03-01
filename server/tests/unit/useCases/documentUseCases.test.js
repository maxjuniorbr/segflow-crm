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

vi.mock('../../../src/infrastructure/repositories/clientRepository.js', () => ({
    findClientById: vi.fn()
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
import { findClientById } from '../../../src/infrastructure/repositories/clientRepository.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('document use cases', () => {
    it('lists documents', async () => {
        listDocumentsRepo.mockResolvedValueOnce({ rows: [{ id: 'doc-1', status: 'Apólice' }], total: 1 });

        const result = await listDocuments({ status: 'Apólice', brokerId: 'broker-1' });

        expect(result.status).toBe(200);
        expect(result.payload.items).toEqual([{ id: 'doc-1', status: 'Apólice' }]);
        expect(listDocumentsRepo).toHaveBeenCalledWith(expect.objectContaining({ brokerId: 'broker-1' }));
    });

    it('returns 404 when document missing', async () => {
        findDocumentById.mockResolvedValueOnce(null);

        const result = await getDocumentByIdUseCase('missing', 'broker-1');

        expect(result.status).toBe(404);
        expect(result.payload.error).toContain('Documento não encontrado');
        expect(findDocumentById).toHaveBeenCalledWith('missing', 'broker-1');
    });

    it('creates document normalizing optional fields', async () => {
        findClientById.mockResolvedValueOnce({ id: 'cli-1' });
        const result = await createDocumentUseCase({
            brokerId: 'broker-1',
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
        expect(findClientById).toHaveBeenCalledWith('cli-1', 'broker-1');
        expect(createDocumentRepo).toHaveBeenCalledWith({
            id: 'doc-123',
            clientId: 'cli-1',
            brokerId: 'broker-1',
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
        findDocumentById.mockResolvedValueOnce({ id: 'doc-1' });
        findClientById.mockResolvedValueOnce({ id: 'cli-1' });
        const result = await updateDocumentUseCase('doc-1', {
            brokerId: 'broker-1',
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
        expect(findDocumentById).toHaveBeenCalledWith('doc-1', 'broker-1');
        expect(findClientById).toHaveBeenCalledWith('cli-1', 'broker-1');
        expect(updateDocumentRepo).toHaveBeenCalledWith({
            id: 'doc-1',
            brokerId: 'broker-1',
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
        findDocumentById.mockResolvedValueOnce({ id: 'doc-1' });
        const result = await deleteDocumentUseCase('doc-1', 'broker-1');

        expect(result.status).toBe(200);
        expect(deleteDocumentRepo).toHaveBeenCalledWith('doc-1', 'broker-1');
    });

    it('returns 404 when deleting non-existent document', async () => {
        findDocumentById.mockResolvedValueOnce(null);
        const result = await deleteDocumentUseCase('missing', 'broker-1');

        expect(result.status).toBe(404);
    });
});
