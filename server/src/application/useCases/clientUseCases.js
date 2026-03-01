// @ts-check
import { randomUUID } from 'crypto';
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
    let {
        id,
        brokerId,
        name,
        personType,
        cpf,
        cnpj,
        rg,
        rgDispatchDate,
        rgIssuer,
        birthDate,
        maritalStatus,
        email,
        phone,
        address,
        notes
    } = payload;

    const clientId = id || randomUUID();

    if (!personType) personType = 'Física';
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    rgDispatchDate = nullifyEmpty(rgDispatchDate);
    birthDate = nullifyEmpty(birthDate);
    cpf = nullifyEmpty(cpf);
    cnpj = nullifyEmpty(cnpj);
    cpf = cpf ? cpf.replace(/[^\d]/g, '') : null;
    cnpj = cnpj ? cnpj.replace(/[^\d]/g, '') : null;
    rg = nullifyEmpty(rg);
    rgIssuer = nullifyEmpty(rgIssuer);
    email = nullifyEmpty(email);
    phone = nullifyEmpty(phone);
    notes = nullifyEmpty(notes);

    const addressJson = address ? JSON.stringify(address) : null;

    if (cpf) {
        const cpfCheck = await findClientByCpf(cpf, brokerId);
        if (cpfCheck) {
            return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
        }
    }

    if (cnpj) {
        const cnpjCheck = await findClientByCnpj(cnpj, brokerId);
        if (cnpjCheck) {
            return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
        }
    }

    try {
        await createClientRepo({
            id: clientId,
            brokerId,
            name,
            personType,
            cpf,
            cnpj,
            rg,
            rgDispatchDate,
            rgIssuer,
            birthDate,
            maritalStatus,
            email,
            phone,
            address: addressJson,
            notes
        });
    } catch (err) {
        if (err.code === '23505') {
            const detail = (err.detail || '').toLowerCase();
            if (detail.includes('cpf')) return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
            if (detail.includes('cnpj')) return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
            return { status: 400, payload: { error: [{ path: ['unknown'], message: 'Registro duplicado' }] } };
        }
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
    let {
        brokerId,
        name,
        personType,
        cpf,
        cnpj,
        rg,
        rgDispatchDate,
        rgIssuer,
        birthDate,
        maritalStatus,
        email,
        phone,
        address,
        notes
    } = payload;

    const existing = await findClientById(id, brokerId);
    if (!existing) {
        return { status: 404, payload: { error: 'Cliente não encontrado' } };
    }

    if (!personType) personType = 'Física';
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    rgDispatchDate = nullifyEmpty(rgDispatchDate);
    birthDate = nullifyEmpty(birthDate);
    cpf = nullifyEmpty(cpf);
    cnpj = nullifyEmpty(cnpj);
    cpf = cpf ? cpf.replace(/[^\d]/g, '') : null;
    cnpj = cnpj ? cnpj.replace(/[^\d]/g, '') : null;
    rg = nullifyEmpty(rg);
    rgIssuer = nullifyEmpty(rgIssuer);
    email = nullifyEmpty(email);
    phone = nullifyEmpty(phone);
    notes = nullifyEmpty(notes);

    const addressJson = address ? JSON.stringify(address) : null;

    if (cpf) {
        const cpfCheck = await findClientByCpfExcludingId(cpf, id, brokerId);
        if (cpfCheck) {
            return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
        }
    }

    if (cnpj) {
        const cnpjCheck = await findClientByCnpjExcludingId(cnpj, id, brokerId);
        if (cnpjCheck) {
            return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
        }
    }

    try {
        await updateClientRepo({
            id,
            brokerId,
            name,
            personType,
            cpf,
            cnpj,
            rg,
            rgDispatchDate,
            rgIssuer,
            birthDate,
            maritalStatus,
            email,
            phone,
            address: addressJson,
            notes
        });
    } catch (err) {
        if (err.code === '23505') {
            const detail = (err.detail || '').toLowerCase();
            if (detail.includes('cpf')) return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
            if (detail.includes('cnpj')) return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
            return { status: 400, payload: { error: [{ path: ['unknown'], message: 'Registro duplicado' }] } };
        }
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
