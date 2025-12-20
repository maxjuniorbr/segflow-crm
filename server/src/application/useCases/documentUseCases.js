// @ts-check
import { randomUUID } from 'crypto';
import { toDocumentResponse } from '../dto/documentDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import {
    listDocuments as listDocumentsRepo,
    findDocumentById,
    createDocument as createDocumentRepo,
    updateDocument as updateDocumentRepo,
    deleteDocument as deleteDocumentRepo
} from '../../infrastructure/repositories/documentRepository.js';

/**
 * @param {Record<string, any>} queryParams
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listDocuments = async (queryParams) => {
    const result = await listDocumentsRepo(queryParams);
    return { status: 200, payload: result.map(toDocumentResponse) };
};

/**
 * @param {string} id
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const getDocumentByIdUseCase = async (id) => {
    const result = await findDocumentById(id);
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
    let { id, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = payload;
    const documentId = id || randomUUID();

    if (!documentNumber || documentNumber === '') documentNumber = null;
    if (!attachmentName || attachmentName === '') attachmentName = null;
    if (!notes || notes === '') notes = null;

    await createDocumentRepo({
        id: documentId,
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

    return { status: 201, payload: buildMessageResponse('Documento criado', { id: documentId }) };
};

/**
 * @param {string} id
 * @param {import('../../types.js').DocumentPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const updateDocumentUseCase = async (id, payload) => {
    let { clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = payload;

    if (!documentNumber || documentNumber === '') documentNumber = null;
    if (!attachmentName || attachmentName === '') attachmentName = null;
    if (!notes || notes === '') notes = null;

    await updateDocumentRepo({
        id,
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
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteDocumentUseCase = async (id) => {
    await deleteDocumentRepo(id);
    return { status: 200, payload: buildMessageResponse('Documento excluído') };
};
