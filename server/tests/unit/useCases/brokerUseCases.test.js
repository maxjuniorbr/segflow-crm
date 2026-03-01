import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../src/infrastructure/repositories/brokerRepository.js', () => ({
    listBrokers: vi.fn(),
    findBrokerById: vi.fn(),
    findBrokerByCnpj: vi.fn(),
    findBrokerBySusep: vi.fn(),
    findBrokerByCnpjExcludingId: vi.fn(),
    findBrokerBySusepExcludingId: vi.fn(),
    createBroker: vi.fn(),
    updateBroker: vi.fn(),
    deleteBroker: vi.fn()
}));

vi.mock('../../../src/infrastructure/repositories/userRepository.js', () => ({
    countUsersByBroker: vi.fn()
}));

vi.mock('../../../src/infrastructure/repositories/clientRepository.js', () => ({
    countClientsByBroker: vi.fn()
}));

import {
    listBrokers as listBrokersRepo,
    findBrokerById,
    findBrokerByCnpj,
    findBrokerBySusep,
    findBrokerByCnpjExcludingId,
    findBrokerBySusepExcludingId,
    createBroker as createBrokerRepo,
    updateBroker as updateBrokerRepo,
    deleteBroker as deleteBrokerRepo
} from '../../../src/infrastructure/repositories/brokerRepository.js';
import { countUsersByBroker } from '../../../src/infrastructure/repositories/userRepository.js';
import { countClientsByBroker } from '../../../src/infrastructure/repositories/clientRepository.js';
import {
    listBrokers,
    getBrokerByIdUseCase,
    createBrokerUseCase,
    updateBrokerUseCase,
    deleteBrokerUseCase
} from '../../../src/application/useCases/brokerUseCases.js';
import { buildBrokerRow } from '../../utils/testFactories.js';

const BROKER_ID = 'bro-1';
const OTHER_BROKER = 'bro-other';

const brokerDbRow = buildBrokerRow();
const brokerPayload = {
    corporateName: 'Razão Social',
    tradeName: 'Nome Fantasia',
    cnpj: '12.345.678/0001-90',
    susepCode: '12345',
    contactName: 'Contato',
    email: 'corretora@example.com',
    phone: '1130002000',
    mobile: '11999999999'
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('listBrokers', () => {
    it('returns 401 when brokerId is missing', async () => {
        const result = await listBrokers(undefined);
        expect(result.status).toBe(401);
        expect(result.payload.error).toMatch(/não autenticado/i);
    });

    it('returns mapped brokers on success', async () => {
        listBrokersRepo.mockResolvedValueOnce([brokerDbRow]);
        const result = await listBrokers(BROKER_ID);
        expect(result.status).toBe(200);
        expect(Array.isArray(result.payload)).toBe(true);
        expect(result.payload[0]).toHaveProperty('corporateName');
        expect(listBrokersRepo).toHaveBeenCalledWith(BROKER_ID);
    });
});

describe('getBrokerByIdUseCase', () => {
    it('returns 401 when brokerId is missing', async () => {
        const result = await getBrokerByIdUseCase('some-id', undefined);
        expect(result.status).toBe(401);
    });

    it('returns 403 when id does not match brokerId', async () => {
        const result = await getBrokerByIdUseCase(OTHER_BROKER, BROKER_ID);
        expect(result.status).toBe(403);
    });

    it('returns 404 when broker not found', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        const result = await getBrokerByIdUseCase(BROKER_ID, BROKER_ID);
        expect(result.status).toBe(404);
    });

    it('returns broker on success', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        const result = await getBrokerByIdUseCase(BROKER_ID, BROKER_ID);
        expect(result.status).toBe(200);
        expect(result.payload).toHaveProperty('corporateName');
    });
});

describe('createBrokerUseCase', () => {
    it('returns 401 when brokerId is missing', async () => {
        const result = await createBrokerUseCase(brokerPayload, undefined);
        expect(result.status).toBe(401);
    });

    it('returns 403 when payload.id does not match brokerId', async () => {
        const result = await createBrokerUseCase({ ...brokerPayload, id: OTHER_BROKER }, BROKER_ID);
        expect(result.status).toBe(403);
    });

    it('returns 409 when broker already exists', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        const result = await createBrokerUseCase(brokerPayload, BROKER_ID);
        expect(result.status).toBe(409);
    });

    it('returns 400 when CNPJ is already registered', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce({ id: 'other' });
        const result = await createBrokerUseCase(brokerPayload, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('cnpj');
    });

    it('returns 400 when SUSEP is already registered', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce(null);
        findBrokerBySusep.mockResolvedValueOnce({ id: 'other' });
        const result = await createBrokerUseCase(brokerPayload, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('susepCode');
    });

    it('creates broker and returns 201 on success', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce(null);
        findBrokerBySusep.mockResolvedValueOnce(null);
        createBrokerRepo.mockResolvedValueOnce();

        const result = await createBrokerUseCase(brokerPayload, BROKER_ID);
        expect(result.status).toBe(201);
        expect(createBrokerRepo).toHaveBeenCalledWith(expect.objectContaining({
            id: BROKER_ID,
            cnpj: '12345678000190'
        }));
    });

    it('skips SUSEP check when susepCode is empty', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce(null);
        createBrokerRepo.mockResolvedValueOnce();

        const result = await createBrokerUseCase({ ...brokerPayload, susepCode: '' }, BROKER_ID);
        expect(result.status).toBe(201);
        expect(findBrokerBySusep).not.toHaveBeenCalled();
    });

    it('sanitizes CNPJ removing non-digit characters', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce(null);
        createBrokerRepo.mockResolvedValueOnce();

        await createBrokerUseCase({ ...brokerPayload, susepCode: null }, BROKER_ID);
        expect(findBrokerByCnpj).toHaveBeenCalledWith('12345678000190');
    });

    it('handles concurrent CNPJ duplicate via 23505', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce(null);
        const dbError = new Error('unique_violation');
        dbError.code = '23505';
        dbError.detail = 'Key (cnpj)=(12345678000190) already exists.';
        createBrokerRepo.mockRejectedValueOnce(dbError);

        const result = await createBrokerUseCase(brokerPayload, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('cnpj');
    });

    it('handles concurrent SUSEP duplicate via 23505', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce(null);
        findBrokerBySusep.mockResolvedValueOnce(null);
        const dbError = new Error('unique_violation');
        dbError.code = '23505';
        dbError.detail = 'Key (susep_code)=(12345) already exists.';
        createBrokerRepo.mockRejectedValueOnce(dbError);

        const result = await createBrokerUseCase(brokerPayload, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('susepCode');
    });

    it('rethrows non-23505 errors', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        findBrokerByCnpj.mockResolvedValueOnce(null);
        createBrokerRepo.mockRejectedValueOnce(new Error('connection error'));

        await expect(createBrokerUseCase({ ...brokerPayload, susepCode: null }, BROKER_ID))
            .rejects.toThrow('connection error');
    });
});

describe('updateBrokerUseCase', () => {
    it('returns 401 when brokerId is missing', async () => {
        const result = await updateBrokerUseCase(BROKER_ID, brokerPayload, undefined);
        expect(result.status).toBe(401);
    });

    it('returns 403 when id does not match brokerId', async () => {
        const result = await updateBrokerUseCase(OTHER_BROKER, brokerPayload, BROKER_ID);
        expect(result.status).toBe(403);
    });

    it('returns 404 when broker not found', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        const result = await updateBrokerUseCase(BROKER_ID, brokerPayload, BROKER_ID);
        expect(result.status).toBe(404);
    });

    it('returns 400 when CNPJ conflicts with another broker', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        findBrokerByCnpjExcludingId.mockResolvedValueOnce({ id: 'other' });
        const result = await updateBrokerUseCase(BROKER_ID, brokerPayload, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('cnpj');
    });

    it('returns 400 when SUSEP conflicts with another broker', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        findBrokerByCnpjExcludingId.mockResolvedValueOnce(null);
        findBrokerBySusepExcludingId.mockResolvedValueOnce({ id: 'other' });
        const result = await updateBrokerUseCase(BROKER_ID, brokerPayload, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('susepCode');
    });

    it('updates broker and returns 200 on success', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        findBrokerByCnpjExcludingId.mockResolvedValueOnce(null);
        findBrokerBySusepExcludingId.mockResolvedValueOnce(null);
        updateBrokerRepo.mockResolvedValueOnce();

        const result = await updateBrokerUseCase(BROKER_ID, brokerPayload, BROKER_ID);
        expect(result.status).toBe(200);
        expect(updateBrokerRepo).toHaveBeenCalledWith(expect.objectContaining({ id: BROKER_ID }));
    });

    it('skips SUSEP check when susepCode is empty', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        findBrokerByCnpjExcludingId.mockResolvedValueOnce(null);
        updateBrokerRepo.mockResolvedValueOnce();

        const result = await updateBrokerUseCase(BROKER_ID, { ...brokerPayload, susepCode: '' }, BROKER_ID);
        expect(result.status).toBe(200);
        expect(findBrokerBySusepExcludingId).not.toHaveBeenCalled();
    });

    it('handles concurrent CNPJ duplicate on update via 23505', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        findBrokerByCnpjExcludingId.mockResolvedValueOnce(null);
        findBrokerBySusepExcludingId.mockResolvedValueOnce(null);
        const dbError = new Error('unique_violation');
        dbError.code = '23505';
        dbError.detail = 'Key (cnpj)=(12345678000190) already exists.';
        updateBrokerRepo.mockRejectedValueOnce(dbError);

        const result = await updateBrokerUseCase(BROKER_ID, brokerPayload, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('cnpj');
    });
});

describe('deleteBrokerUseCase', () => {
    it('returns 401 when brokerId is missing', async () => {
        const result = await deleteBrokerUseCase(BROKER_ID, undefined);
        expect(result.status).toBe(401);
    });

    it('returns 403 when id does not match brokerId', async () => {
        const result = await deleteBrokerUseCase(OTHER_BROKER, BROKER_ID);
        expect(result.status).toBe(403);
    });

    it('returns 404 when broker not found', async () => {
        findBrokerById.mockResolvedValueOnce(null);
        const result = await deleteBrokerUseCase(BROKER_ID, BROKER_ID);
        expect(result.status).toBe(404);
    });

    it('deletes broker and returns 200 when no dependents', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        countUsersByBroker.mockResolvedValueOnce(0);
        countClientsByBroker.mockResolvedValueOnce(0);
        deleteBrokerRepo.mockResolvedValueOnce();
        const result = await deleteBrokerUseCase(BROKER_ID, BROKER_ID);
        expect(result.status).toBe(200);
        expect(deleteBrokerRepo).toHaveBeenCalledWith(BROKER_ID);
    });

    it('returns 400 when broker has active users', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        countUsersByBroker.mockResolvedValueOnce(3);
        countClientsByBroker.mockResolvedValueOnce(0);
        const result = await deleteBrokerUseCase(BROKER_ID, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error).toMatch(/usuários ou clientes/i);
        expect(deleteBrokerRepo).not.toHaveBeenCalled();
    });

    it('returns 400 when broker has active clients', async () => {
        findBrokerById.mockResolvedValueOnce(brokerDbRow);
        countUsersByBroker.mockResolvedValueOnce(0);
        countClientsByBroker.mockResolvedValueOnce(5);
        const result = await deleteBrokerUseCase(BROKER_ID, BROKER_ID);
        expect(result.status).toBe(400);
        expect(result.payload.error).toMatch(/usuários ou clientes/i);
        expect(deleteBrokerRepo).not.toHaveBeenCalled();
    });
});
