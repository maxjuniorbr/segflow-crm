// @ts-check
import { randomUUID } from 'node:crypto';
import { Client } from '../../domain/entities/Client.js';
import { toClientResponse } from '../dto/clientDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import { decodeCursor, encodeCursor } from '../utils/cursorPagination.js';
import { nullifyEmpty } from '../utils/nullifyEmpty.js';
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
} from '../../infrastructure/repositories/clientRepository.js';
import { mapUniqueConstraintError } from '../utils/uniqueConstraintError.js';

const sanitizeDocument = (value) => {
    const clean = nullifyEmpty(value);
    return clean ? clean.replaceAll(/[^\d]/g, '') : null;
};

/**
 * @param {import('../../types.js').ClientPayload} payload
 */
const sanitizeClientPayload = (payload) => ({
    name: payload.name,
    brokerId: payload.brokerId,
    personType: payload.personType || 'Física',
    maritalStatus: payload.maritalStatus || 'Solteiro(a)',
    cpf: sanitizeDocument(payload.cpf),
    cnpj: sanitizeDocument(payload.cnpj),
    rg: nullifyEmpty(payload.rg),
    rgDispatchDate: nullifyEmpty(payload.rgDispatchDate),
    rgIssuer: nullifyEmpty(payload.rgIssuer),
    birthDate: nullifyEmpty(payload.birthDate),
    email: nullifyEmpty(payload.email),
    phone: nullifyEmpty(payload.phone),
    notes: nullifyEmpty(payload.notes),
    addressJson: payload.address ? JSON.stringify(payload.address) : null
});

/**
 * @param {{ brokerId?: string, search?: string, personType?: string, limit?: number, offset?: number, cursor?: string }} [filters]
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listClients = async (filters = {}) => {
    const rawLimit = Number(filters.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 200) : 100;
    const rawOffset = Number(filters.offset);
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;
    const cursor = filters.cursor ? decodeCursor(filters.cursor) : null;
    if (filters.cursor && !cursor) {
        return { status: 400, payload: { error: 'Cursor inválido' } };
    }

    const result = await listClientsRepo({ ...filters, limit, offset, cursor });
    const nextCursor = result.rows.length === limit
        ? encodeCursor({
            createdAt: new Date(result.rows[result.rows.length - 1].created_at).toISOString(),
            id: result.rows[result.rows.length - 1].id
        })
        : null;
    return {
        status: 200,
        payload: {
            items: result.rows.map(row => toClientResponse(Client.fromDatabase(row))),
            total: result.total,
            limit,
            offset: cursor ? 0 : offset,
            nextCursor
        }
    };
};

/**
 * @param {string} id
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const getClientByIdUseCase = async (id, brokerId) => {
    const result = await findClientById(id, brokerId);

    if (!result) {
        return { status: 404, payload: { error: 'Cliente não encontrado' } };
    }

    const client = toClientResponse(Client.fromDatabase(result));
    return { status: 200, payload: client };
};

/**
 * @param {import('../../types.js').ClientPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const createClientUseCase = async (payload) => {
    const clientId = payload.id || randomUUID();
    const sanitized = sanitizeClientPayload(payload);

    if (sanitized.cpf) {
        const cpfCheck = await findClientByCpf(sanitized.cpf, sanitized.brokerId);
        if (cpfCheck) {
            return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
        }
    }

    if (sanitized.cnpj) {
        const cnpjCheck = await findClientByCnpj(sanitized.cnpj, sanitized.brokerId);
        if (cnpjCheck) {
            return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
        }
    }

    try {
        const { addressJson, ...fields } = sanitized;
        await createClientRepo({
            id: clientId,
            ...fields,
            address: addressJson
        });
    } catch (err) {
        const result = mapUniqueConstraintError(err, [
            ['cpf', 'cpf', 'CPF já cadastrado'],
            ['cnpj', 'cnpj', 'CNPJ já cadastrado']
        ]);
        if (result) return result;
        throw err;
    }

    return {
        status: 201,
        payload: buildMessageResponse('Cliente criado', { id: clientId })
    };
};

/**
 * @param {string} id
 * @param {import('../../types.js').ClientPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const updateClientUseCase = async (id, payload) => {
    const { brokerId } = payload;
    const existing = await findClientById(id, brokerId);
    if (!existing) {
        return { status: 404, payload: { error: 'Cliente não encontrado' } };
    }

    const sanitized = sanitizeClientPayload(payload);

    if (sanitized.cpf) {
        const cpfCheck = await findClientByCpfExcludingId(sanitized.cpf, id, sanitized.brokerId);
        if (cpfCheck) {
            return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
        }
    }

    if (sanitized.cnpj) {
        const cnpjCheck = await findClientByCnpjExcludingId(sanitized.cnpj, id, sanitized.brokerId);
        if (cnpjCheck) {
            return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
        }
    }

    try {
        const { addressJson, ...fields } = sanitized;
        await updateClientRepo({
            id,
            ...fields,
            address: addressJson
        });
    } catch (err) {
        const result = mapUniqueConstraintError(err, [
            ['cpf', 'cpf', 'CPF já cadastrado'],
            ['cnpj', 'cnpj', 'CNPJ já cadastrado']
        ]);
        if (result) return result;
        throw err;
    }

    return { status: 200, payload: buildMessageResponse('Cliente atualizado com sucesso') };
};

/**
 * @param {string} id
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteClientUseCase = async (id, brokerId) => {
    const existing = await findClientById(id, brokerId);
    if (!existing) {
        return { status: 404, payload: { error: 'Cliente não encontrado' } };
    }

    const proposalsCheck = await countActiveDocumentsForClient(id, brokerId);
    if (Number(proposalsCheck?.count) > 0) {
        return { status: 400, payload: { error: 'Não é possível excluir cliente com documentos ativos.' } };
    }

    await deleteClientRepo(id, brokerId);

    return { status: 200, payload: buildMessageResponse('Cliente excluído') };
};
