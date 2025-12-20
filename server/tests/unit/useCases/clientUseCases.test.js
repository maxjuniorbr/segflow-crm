import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('crypto', () => ({
    randomUUID: vi.fn(() => 'uuid-123')
}));

vi.mock('../../../src/infrastructure/repositories/clientRepository.js', () => ({
    listClients: vi.fn(),
    findClientById: vi.fn(),
    findClientByCpf: vi.fn(),
    findClientByCnpj: vi.fn(),
    findClientByCpfExcludingId: vi.fn(),
    findClientByCnpjExcludingId: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
    countActiveDocumentsForClient: vi.fn()
}));

import {
    listClients,
    getClientByIdUseCase,
    createClientUseCase,
    updateClientUseCase,
    deleteClientUseCase
} from '../../../src/application/useCases/clientUseCases.js';
import {
    listClients as listClientsRepo,
    findClientById,
    findClientByCpf,
    findClientByCnpj,
    findClientByCpfExcludingId,
    findClientByCnpjExcludingId,
    createClient as createClientRepo,
    updateClient as updateClientRepo,
    deleteClient as deleteClientRepo,
    countActiveDocumentsForClient
} from '../../../src/infrastructure/repositories/clientRepository.js';

const sampleRow = {
    id: 'cli-1',
    name: 'Joao',
    persontype: 'Física',
    cpf: '123',
    cnpj: null,
    rg: null,
    rgdispatchdate: null,
    rgissuer: null,
    birthdate: '1990-01-01',
    maritalstatus: 'Solteiro(a)',
    email: 'joao@example.com',
    phone: '11999999999',
    address: JSON.stringify({ city: 'SP' }),
    notes: null,
    createdat: '2024-01-01'
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('client use cases', () => {
    it('lists clients and maps address', async () => {
        listClientsRepo.mockResolvedValueOnce([sampleRow]);

        const result = await listClients();

        expect(result.status).toBe(200);
        expect(result.payload[0].id).toBe('cli-1');
        expect(result.payload[0].address).toEqual({ city: 'SP' });
    });

    it('returns 404 when client not found', async () => {
        findClientById.mockResolvedValueOnce(null);

        const result = await getClientByIdUseCase('missing');

        expect(result.status).toBe(404);
        expect(result.payload.error).toContain('Cliente não encontrado');
    });

    it('prevents create when CPF already exists', async () => {
        findClientByCpf.mockResolvedValueOnce({ id: 'dup' });

        const result = await createClientUseCase({
            name: 'Novo',
            cpf: '123',
            personType: 'Física'
        });

        expect(result.status).toBe(400);
        expect(createClientRepo).not.toHaveBeenCalled();
    });

    it('creates client normalizing empty fields', async () => {
        findClientByCpf.mockResolvedValueOnce(null);
        findClientByCnpj.mockResolvedValueOnce(null);

        const result = await createClientUseCase({
            name: 'Novo',
            personType: 'Física',
            cpf: '',
            cnpj: '',
            rg: '',
            rgDispatchDate: '',
            rgIssuer: '',
            birthDate: '',
            maritalStatus: '',
            email: '',
            phone: '',
            address: { city: 'SP' },
            notes: ''
        });

        expect(result.status).toBe(201);
        expect(createClientRepo).toHaveBeenCalledWith({
            id: 'uuid-123',
            name: 'Novo',
            personType: 'Física',
            cpf: null,
            cnpj: null,
            rg: null,
            rgDispatchDate: null,
            rgIssuer: null,
            birthDate: null,
            maritalStatus: 'Solteiro(a)',
            email: null,
            phone: null,
            address: JSON.stringify({ city: 'SP' }),
            notes: null
        });
    });

    it('rejects duplicate CNPJ on update', async () => {
        findClientByCnpjExcludingId.mockResolvedValueOnce({ id: 'dup' });

        const result = await updateClientUseCase('cli-1', { cnpj: '123', name: 'Nome' });

        expect(result.status).toBe(400);
        expect(updateClientRepo).not.toHaveBeenCalled();
    });

    it('prevents delete when client has active documents', async () => {
        countActiveDocumentsForClient.mockResolvedValueOnce({ count: '2' });

        const result = await deleteClientUseCase('cli-1');

        expect(result.status).toBe(400);
        expect(deleteClientRepo).not.toHaveBeenCalled();
    });

    it('deletes client when no active documents', async () => {
        countActiveDocumentsForClient.mockResolvedValueOnce({ count: '0' });

        const result = await deleteClientUseCase('cli-1');

        expect(result.status).toBe(200);
        expect(deleteClientRepo).toHaveBeenCalledWith('cli-1');
    });
});
