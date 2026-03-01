// @ts-check
import { Broker } from '../../domain/entities/Broker.js';
import { toBrokerResponse } from '../dto/brokerDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
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
} from '../../infrastructure/repositories/brokerRepository.js';
import { countUsersByBroker } from '../../infrastructure/repositories/userRepository.js';
import { countClientsByBroker } from '../../infrastructure/repositories/clientRepository.js';

/**
 * @param {string|null|undefined} cnpj
 * @returns {string|null}
 */
const sanitizeCnpj = (cnpj) => (cnpj ? cnpj.replace(/[^\d]/g, '') : null);

/**
 * @param {string} [brokerId]
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listBrokers = async (brokerId) => {
    if (!brokerId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }
    const result = await listBrokersRepo(brokerId);
    return {
        status: 200,
        payload: result.map(row => toBrokerResponse(Broker.fromDatabase(row)))
    };
};

/**
 * @param {string} id
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const getBrokerByIdUseCase = async (id, brokerId) => {
    if (!brokerId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }

    if (id !== brokerId) {
        return { status: 403, payload: { error: 'Acesso negado' } };
    }

    const result = await findBrokerById(id);
    if (!result) {
        return { status: 404, payload: { error: 'Corretora não encontrada' } };
    }

    return { status: 200, payload: toBrokerResponse(Broker.fromDatabase(result)) };
};

/**
 * @param {import('../../types.js').BrokerPayload} payload
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const createBrokerUseCase = async (payload, brokerId) => {
    if (!brokerId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }

    let { id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile } = payload;
    if (id && id !== brokerId) {
        return { status: 403, payload: { error: 'Acesso negado' } };
    }

    const existingBroker = await findBrokerById(brokerId);
    if (existingBroker) {
        return { status: 409, payload: { error: 'Corretora já cadastrada' } };
    }

    const cnpjClean = sanitizeCnpj(cnpj);
    susepCode = susepCode ? susepCode.trim() : null;

    const cnpjCheck = await findBrokerByCnpj(cnpjClean);
    if (cnpjCheck) {
        return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
    }

    if (susepCode && susepCode.trim() !== '') {
        const susepCheck = await findBrokerBySusep(susepCode);
        if (susepCheck) {
            return { status: 400, payload: { error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }] } };
        }
    }

    try {
        await createBrokerRepo({
            id: brokerId,
            corporateName,
            tradeName,
            cnpj: cnpjClean,
            susepCode,
            contactName,
            email,
            phone,
            mobile
        });
    } catch (err) {
        if (err.code === '23505') {
            const detail = err.detail || '';
            if (detail.includes('cnpj')) return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
            if (detail.includes('susep_code')) return { status: 400, payload: { error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }] } };
            return { status: 400, payload: { error: [{ path: ['unknown'], message: 'Registro duplicado' }] } };
        }
        throw err;
    }

    return { status: 201, payload: buildMessageResponse('Corretora criada', { id: brokerId }) };
};

/**
 * @param {string} id
 * @param {import('../../types.js').BrokerPayload} payload
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const updateBrokerUseCase = async (id, payload, brokerId) => {
    if (!brokerId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }

    if (id !== brokerId) {
        return { status: 403, payload: { error: 'Acesso negado' } };
    }

    const existingBroker = await findBrokerById(id);
    if (!existingBroker) {
        return { status: 404, payload: { error: 'Corretora não encontrada' } };
    }

    let { corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile } = payload;
    const cnpjClean = sanitizeCnpj(cnpj);
    susepCode = susepCode ? susepCode.trim() : null;

    const cnpjCheck = await findBrokerByCnpjExcludingId(cnpjClean, id);
    if (cnpjCheck) {
        return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
    }

    if (susepCode && susepCode.trim() !== '') {
        const susepCheck = await findBrokerBySusepExcludingId(susepCode, id);
        if (susepCheck) {
            return { status: 400, payload: { error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }] } };
        }
    }

    try {
        await updateBrokerRepo({
            id,
            corporateName,
            tradeName,
            cnpj: cnpjClean,
            susepCode,
            contactName,
            email,
            phone,
            mobile
        });
    } catch (err) {
        if (err.code === '23505') {
            const detail = err.detail || '';
            if (detail.includes('cnpj')) return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
            if (detail.includes('susep_code')) return { status: 400, payload: { error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }] } };
            return { status: 400, payload: { error: [{ path: ['unknown'], message: 'Registro duplicado' }] } };
        }
        throw err;
    }

    return { status: 200, payload: buildMessageResponse('Corretora atualizada com sucesso') };
};

/**
 * @param {string} id
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteBrokerUseCase = async (id, brokerId) => {
    if (!brokerId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }

    if (id !== brokerId) {
        return { status: 403, payload: { error: 'Acesso negado' } };
    }

    const existingBroker = await findBrokerById(id);
    if (!existingBroker) {
        return { status: 404, payload: { error: 'Corretora não encontrada' } };
    }

    const [userCount, clientCount] = await Promise.all([
        countUsersByBroker(id),
        countClientsByBroker(id)
    ]);
    if (userCount > 0 || clientCount > 0) {
        return { status: 400, payload: { error: 'Não é possível excluir corretora com usuários ou clientes vinculados.' } };
    }

    await deleteBrokerRepo(id);
    return { status: 200, payload: buildMessageResponse('Corretora excluída') };
};
