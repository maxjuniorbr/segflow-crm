// @ts-check
import { randomUUID } from 'crypto';
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

/**
 * @param {string|null|undefined} cnpj
 * @returns {string|null}
 */
const sanitizeCnpj = (cnpj) => (cnpj ? cnpj.replace(/[^\d]/g, '') : null);

/**
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listBrokers = async () => {
    const result = await listBrokersRepo();
    return {
        status: 200,
        payload: result.map(row => toBrokerResponse(Broker.fromDatabase(row)))
    };
};

/**
 * @param {string} id
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const getBrokerByIdUseCase = async (id) => {
    const result = await findBrokerById(id);
    if (!result) {
        return { status: 404, payload: { error: 'Corretora não encontrada' } };
    }

    return { status: 200, payload: toBrokerResponse(Broker.fromDatabase(result)) };
};

/**
 * @param {import('../../types.js').BrokerPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const createBrokerUseCase = async (payload) => {
    let { id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile } = payload;
    const brokerId = id || randomUUID();
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

    return { status: 201, payload: buildMessageResponse('Corretora criada', { id: brokerId }) };
};

/**
 * @param {string} id
 * @param {import('../../types.js').BrokerPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const updateBrokerUseCase = async (id, payload) => {
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

    return { status: 200, payload: buildMessageResponse('Corretora atualizada com sucesso') };
};

/**
 * @param {string} id
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteBrokerUseCase = async (id) => {
    await deleteBrokerRepo(id);
    return { status: 200, payload: buildMessageResponse('Corretora excluída') };
};
