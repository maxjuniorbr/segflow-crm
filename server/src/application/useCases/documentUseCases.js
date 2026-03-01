// @ts-check
import { randomUUID } from 'node:crypto';
import { toDocumentResponse } from '../dto/documentDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import { decodeCursor, encodeCursor } from '../utils/cursorPagination.js';
import { nullifyEmpty } from '../utils/nullifyEmpty.js';
import {
    listDocuments as listDocumentsRepo,
    findDocumentById,
    createDocument as createDocumentRepo,
    updateDocument as updateDocumentRepo,
    deleteDocument as deleteDocumentRepo
} from '../../infrastructure/repositories/documentRepository.js';
import { findClientById } from '../../infrastructure/repositories/clientRepository.js';

/**
 * @param {Record<string, any>} queryParams
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listDocuments = async (queryParams) => {
    const rawLimit = Number(queryParams?.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 200) : 100;
    const rawOffset = Number(queryParams?.offset);
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;
    const cursor = queryParams?.cursor ? decodeCursor(queryParams.cursor) : null;
    if (queryParams?.cursor && !cursor) {
        return { status: 400, payload: { error: 'Cursor inválido' } };
    }

    const result = await listDocumentsRepo({
        brokerId: queryParams.brokerId,
        clientId: queryParams.clientId,
        status: queryParams.status,
        search: queryParams.search,
        limit,
        offset,
        cursor
    });
    const nextCursor = result.rows.length === limit
        ? encodeCursor({
            createdAt: new Date(result.rows[result.rows.length - 1].createdAt).toISOString(),
            id: result.rows[result.rows.length - 1].id
        })
        : null;
    return {
        status: 200,
        payload: {
            items: result.rows.map(toDocumentResponse),
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
export const getDocumentByIdUseCase = async (id, brokerId) => {
    const result = await findDocumentById(id, brokerId);
    if (!result) {
        return { status: 404, payload: { error: 'Documento não encontrado' } };
    }

    return { status: 200, payload: toDocumentResponse(result) };
};

/**
 * @param {import('../../types.js').DocumentPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const createDocumentUseCase = async (payload) => {
    let { id, brokerId, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = payload;
    const documentId = id || randomUUID();

    if (!brokerId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }

    const client = await findClientById(clientId, brokerId);
    if (!client) {
        return { status: 404, payload: { error: 'Cliente não encontrado' } };
    }

    documentNumber = nullifyEmpty(documentNumber);
    attachmentName = nullifyEmpty(attachmentName);
    notes = nullifyEmpty(notes);

    await createDocumentRepo({
        id: documentId,
        clientId,
        brokerId,
        type,
        company,
        documentNumber,
        startDate,
        endDate,
        status,
        attachmentName,
        notes
    });

    return { status: 201, payload: buildMessageResponse('Documento criado', { id: documentId }) };
};

/**
 * @param {string} id
 * @param {import('../../types.js').DocumentPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const updateDocumentUseCase = async (id, payload) => {
    let { brokerId, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = payload;

    if (!brokerId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }

    const existing = await findDocumentById(id, brokerId);
    if (!existing) {
        return { status: 404, payload: { error: 'Documento não encontrado' } };
    }

    const client = await findClientById(clientId, brokerId);
    if (!client) {
        return { status: 404, payload: { error: 'Cliente não encontrado' } };
    }

    documentNumber = nullifyEmpty(documentNumber);
    attachmentName = nullifyEmpty(attachmentName);
    notes = nullifyEmpty(notes);

    await updateDocumentRepo({
        id,
        brokerId,
        clientId,
        type,
        company,
        documentNumber,
        startDate,
        endDate,
        status,
        attachmentName,
        notes
    });

    return { status: 200, payload: buildMessageResponse('Documento atualizado') };
};

/**
 * @param {string} id
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteDocumentUseCase = async (id, brokerId) => {
    const existing = await findDocumentById(id, brokerId);
    if (!existing) {
        return { status: 404, payload: { error: 'Documento não encontrado' } };
    }
    await deleteDocumentRepo(id, brokerId);
    return { status: 200, payload: buildMessageResponse('Documento excluído') };
};
